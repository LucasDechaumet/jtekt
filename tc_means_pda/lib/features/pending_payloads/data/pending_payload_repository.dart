import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:tc_means_pda/core/api/api_client.dart';
import 'package:tc_means_pda/data/local/app_database.dart';

class PendingPayloadRepository {
  final pendingCount = ValueNotifier<int>(0);

  final List<Map<String, String>> _memoryQueue = [];

  bool _isDisposed = false;
  bool _isSyncing = false;
  bool _useMemoryFallback = false;

  Future<void> init() async {
    try {
      await AppDatabase.instance;
      await refreshCount();
    } catch (error, stackTrace) {
      _useMemoryFallback = true;
      debugPrint('SQLite unavailable, using memory queue: $error');
      debugPrintStack(stackTrace: stackTrace);
      _setCount(_memoryQueue.length);
    }
  }

  Future<void> save(Map<String, dynamic> payload) async {
    final row = {
      'payloadJson': jsonEncode(payload),
      'createdAt': DateTime.now().toUtc().toIso8601String(),
    };

    if (_useMemoryFallback) {
      _memoryQueue.add(row);
      _setCount(_memoryQueue.length);
      return;
    }

    try {
      final database = await AppDatabase.instance;
      await database.insert(AppDatabase.pendingPayloadsTable, row);
      await refreshCount();
    } catch (error, stackTrace) {
      _useMemoryFallback = true;
      _memoryQueue.add(row);
      debugPrint('SQLite save failed, using memory queue: $error');
      debugPrintStack(stackTrace: stackTrace);
      _setCount(_memoryQueue.length);
    }
  }

  Future<void> sync({
    required ApiClient apiClient,
    required String targetIp,
  }) async {
    if (_isSyncing || targetIp.trim().isEmpty) {
      return;
    }

    _isSyncing = true;
    try {
      final healthStatus = await apiClient.getHealth(targetIp);
      if (healthStatus != ApiCallStatus.success) {
        return;
      }

      if (_useMemoryFallback) {
        await _syncMemoryQueue(apiClient: apiClient, targetIp: targetIp);
      } else {
        await _syncDatabaseQueue(apiClient: apiClient, targetIp: targetIp);
      }
    } finally {
      _isSyncing = false;
      await refreshCount();
    }
  }

  Future<void> refreshCount() async {
    if (_useMemoryFallback) {
      _setCount(_memoryQueue.length);
      return;
    }

    final database = await AppDatabase.instance;
    final result = await database.rawQuery(
      'SELECT COUNT(*) AS count FROM ${AppDatabase.pendingPayloadsTable}',
    );
    final count = result.first['count'] as int? ?? 0;

    _setCount(count);
  }

  Future<void> _syncDatabaseQueue({
    required ApiClient apiClient,
    required String targetIp,
  }) async {
    final database = await AppDatabase.instance;
    final rows = await database.query(
      AppDatabase.pendingPayloadsTable,
      orderBy: 'createdAt ASC, id ASC',
    );

    for (final row in rows) {
      final id = row['id'];
      final payloadJson = row['payloadJson'];
      if (id is! int || payloadJson is! String) {
        continue;
      }

      final payload = _decodePayload(payloadJson);
      if (payload == null) {
        continue;
      }

      final status = await apiClient.sendPendingPayload(
        targetIp: targetIp,
        payload: payload,
      );

      if (status != ApiCallStatus.success) {
        return;
      }

      await database.delete(
        AppDatabase.pendingPayloadsTable,
        where: 'id = ?',
        whereArgs: [id],
      );
    }
  }

  Future<void> _syncMemoryQueue({
    required ApiClient apiClient,
    required String targetIp,
  }) async {
    while (_memoryQueue.isNotEmpty) {
      final row = _memoryQueue.first;
      final payload = _decodePayload(row['payloadJson']);
      if (payload == null) {
        _memoryQueue.removeAt(0);
        continue;
      }

      final status = await apiClient.sendPendingPayload(
        targetIp: targetIp,
        payload: payload,
      );

      if (status != ApiCallStatus.success) {
        return;
      }

      _memoryQueue.removeAt(0);
    }
  }

  Map<String, dynamic>? _decodePayload(String? payloadJson) {
    if (payloadJson == null) {
      return null;
    }

    try {
      final decoded = jsonDecode(payloadJson);
      return decoded is Map<String, dynamic> ? decoded : null;
    } on FormatException {
      return null;
    }
  }

  void _setCount(int count) {
    if (!_isDisposed) {
      pendingCount.value = count;
    }
  }

  void dispose() {
    _isDisposed = true;
    pendingCount.dispose();
  }
}
