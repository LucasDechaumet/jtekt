// ignore_for_file: non_constant_identifier_names

class MeanModel {
  String username;
  String meanNumber;
  String in_out;
  DateTime date;

  MeanModel({
    required this.username,
    required this.meanNumber,
    required this.in_out,
    required this.date,
  });

  Map<String, dynamic> toJson() {
    return {
      'in_out': in_out,
      'date': date.toIso8601String(), // Convert DateTime to ISO 8601 format
      'username': username,
      'meanNumber': meanNumber,
    };
  }

  factory MeanModel.fromJson(Map<String, dynamic> json) {
    return MeanModel(
      in_out: json['in_out'],
      date: DateTime.parse(
          json['date']), // Parse the date from String to DateTime
      username: json['username'],
      meanNumber: json['meanNumber'],
    );
  }
}
