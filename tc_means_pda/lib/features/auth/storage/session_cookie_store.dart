import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SessionCookieStore {
  static const _cookiesKey = 'session_cookies';

  final FlutterSecureStorage _storage = const FlutterSecureStorage(
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );

  Future<Map<String, String>> readCookies() async {
    try {
      final rawCookies = await _storage.read(key: _cookiesKey);
      if (rawCookies == null || rawCookies.isEmpty) {
        return {};
      }

      final decoded = jsonDecode(rawCookies);
      if (decoded is! Map<String, dynamic>) {
        return {};
      }

      return decoded.map(
        (key, value) => MapEntry(key, value?.toString() ?? ''),
      );
    } catch (error, stackTrace) {
      debugPrint('Secure cookie read failed: $error');
      debugPrintStack(stackTrace: stackTrace);
      return {};
    }
  }

  Future<void> saveCookies(Map<String, String> cookies) async {
    try {
      await _storage.write(key: _cookiesKey, value: jsonEncode(cookies));
    } catch (error, stackTrace) {
      debugPrint('Secure cookie save failed: $error');
      debugPrintStack(stackTrace: stackTrace);
    }
  }

  Future<void> clearCookies() async {
    try {
      await _storage.delete(key: _cookiesKey);
    } catch (error, stackTrace) {
      debugPrint('Secure cookie clear failed: $error');
      debugPrintStack(stackTrace: stackTrace);
    }
  }
}
