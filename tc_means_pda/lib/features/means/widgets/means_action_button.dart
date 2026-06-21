import 'package:flutter/material.dart';
import 'package:tc_means_pda/features/means/models/means_action.dart';

class MeansActionButton extends StatelessWidget {
  const MeansActionButton({
    super.key,
    required this.action,
    required this.onPressed,
  });

  final MeansAction action;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return FilledButton.icon(
      onPressed: onPressed,
      style: FilledButton.styleFrom(
        minimumSize: const Size.fromHeight(72),
        backgroundColor: action.color,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      icon: Icon(action.icon, size: 28),
      label: Text(
        action.label,
        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
      ),
    );
  }
}
