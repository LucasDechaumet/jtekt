import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ConfigRepository {
  static const _targetIpKey = 'target_ip';

  static String _memoryTargetIp = '';
  static bool _useMemoryFallback = false;

  Future<String> getTargetIp() async {
    if (_useMemoryFallback) {
      return _memoryTargetIp;
    }

    try {
      final preferences = await SharedPreferences.getInstance();
      return preferences.getString(_targetIpKey) ?? _memoryTargetIp;
    } catch (error, stackTrace) {
      _useMemoryFallback = true;
      debugPrint('SharedPreferences unavailable, using memory config: $error');
      debugPrintStack(stackTrace: stackTrace);
      return _memoryTargetIp;
    }
  }

  Future<void> saveTargetIp(String targetIp) async {
    _memoryTargetIp = targetIp;

    if (_useMemoryFallback) {
      return;
    }

    try {
      final preferences = await SharedPreferences.getInstance();
      await preferences.setString(_targetIpKey, targetIp);
    } catch (error, stackTrace) {
      _useMemoryFallback = true;
      debugPrint('SharedPreferences save failed, using memory config: $error');
      debugPrintStack(stackTrace: stackTrace);
    }
  }
}
