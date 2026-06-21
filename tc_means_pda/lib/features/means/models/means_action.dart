import 'package:flutter/material.dart';

enum MeansAction {
  entry('Entrée', false, Color(0xFF16A34A), Icons.login_rounded),
  exit('Sortie', true, Color(0xFFDC2626), Icons.logout_rounded);

  const MeansAction(this.label, this.isOut, this.color, this.icon);

  final String label;
  final bool isOut;
  final Color color;
  final IconData icon;
}
