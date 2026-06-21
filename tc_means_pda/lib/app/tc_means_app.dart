import 'package:flutter/material.dart';
import 'package:tc_means_pda/app/app_theme.dart';
import 'package:tc_means_pda/features/auth/screens/auth_gate.dart';

class TcMeansApp extends StatelessWidget {
  const TcMeansApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TC Means',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: const AuthGate(),
    );
  }
}
