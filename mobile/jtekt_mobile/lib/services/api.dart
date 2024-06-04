import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:jtekt_mobile/models/mean_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Api {
  static const String defaultIpAddress = 'http://';

  static Future<String> _loadIpAddress() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String savedIpAddress = prefs.getString('ipAddress') ?? "null";
    return savedIpAddress;
  }

  static Future<void> sendData(List<MeanModel> data) async {
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
        // Succès
        print('Data sent successfully');
      } else {
        // Échec
        print('Failed to send data. Status code: ${response.statusCode}');
      }
    } catch (e) {
      print('Error sending data: $e');
    }
  }

  static Future<bool> testIpAddress(baseUrl) async {
    try {
      print('$defaultIpAddress$baseUrl');
      final response =
          await http.get(Uri.parse('$defaultIpAddress$baseUrl/test/server'));
      return response.statusCode == 200 ? true : false;
    } catch (e) {
      print('Error connecting: $e');
      return false;
    }
  }
}
