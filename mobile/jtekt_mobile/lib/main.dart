import 'package:flutter/material.dart';
import './screens/home_page.dart';

void main() {
  runApp(
    MaterialApp(
        title: "jtektApp",
        theme: ThemeData(
          primarySwatch: Colors.blue,
        ),
        darkTheme: ThemeData(
          primarySwatch: Colors.red,
          brightness: Brightness.dark,
        ),
        home: const HomePage()),
  );
}
