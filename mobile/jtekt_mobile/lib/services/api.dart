import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:jtekt_mobile/models/mean_model.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:battery_plus/battery_plus.dart';

class Api {
  static const String defaultIpAddress = 'http://';

  static Future<String> _loadIpAddress() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String savedIpAddress = prefs.getString('ipAddress') ?? "null";
    return savedIpAddress;
  }

  static Future<void> _saveFailedData(List<MeanModel> data) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    List<String> storedData = prefs.getStringList('failedData') ?? [];
    storedData.add(jsonEncode(data.map((mean) => mean.toJson()).toList()));
    await prefs.setStringList('failedData', storedData);
  }

  static Future<List<List<MeanModel>>> _loadFailedData() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    List<String> storedData = prefs.getStringList('failedData') ?? [];
    return storedData.map((data) {
      List<dynamic> jsonData = jsonDecode(data);
      return jsonData.map((mean) => MeanModel.fromJson(mean)).toList();
    }).toList();
  }

  static Future<void> _clearFailedData() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove('failedData');
  }

  static Future<bool> sendData(List<MeanModel> data) async {
    try {
      final String baseUrl = await _loadIpAddress();
      final response = await http.post(
        Uri.parse('$defaultIpAddress$baseUrl/mean/addMeansFromMobile'),
        headers: <String, String>{
          'Content-Type': 'application/json',
        },
        body: jsonEncode(data.map((mean) => mean.toJson()).toList()),
      );

      if (response.statusCode == 200) {
        return true;
      } else {
        await _saveFailedData(data);
        return false;
      }
    } catch (e) {
      print('Error sending data: $e');
      await _saveFailedData(data);
      return false;
    }
  }

  static Future<void> retryFailedData() async {
    print("CHARGINGGGGGGGGGGGGGGGGGGGGGGGGGGGGG");
    List<List<MeanModel>> failedDataList = await _loadFailedData();
    for (var data in failedDataList) {
      bool success = await sendData(data);
      if (!success) {
        return; // Stop if sending data fails again
      }
    }
    await _clearFailedData(); // Clear the storage if all data is successfully sent
  }

  static Future<bool> testIpAddress(String baseUrl) async {
    try {
      final response = await http
          .get(
            Uri.parse('$defaultIpAddress$baseUrl/test/server'),
          )
          .timeout(const Duration(seconds: 6));
      return response.statusCode == 200;
    } catch (e) {
      print('Error connecting: $e');
      return false;
    }
  }

  static void monitorBatteryState() {
    final battery = Battery();
    battery.onBatteryStateChanged.listen((BatteryState state) {
      if (state == BatteryState.charging) {
        Future.delayed(const Duration(seconds: 30), () {
          print('Retrying failed data');
          retryFailedData();
        });
      }
    });
  }
}
