import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

class PendingCountFab extends StatelessWidget {
  const PendingCountFab({super.key, required this.countListenable});

  final ValueListenable<int> countListenable;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<int>(
      valueListenable: countListenable,
      builder: (context, count, child) {
        return SizedBox(
          width: 44,
          height: 44,
          child: FloatingActionButton.small(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('$count envoi(s) en attente'),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
            tooltip: 'Envois en attente',
            child: Text(
              '$count',
              style: const TextStyle(fontWeight: FontWeight.w800),
            ),
          ),
        );
      },
    );
  }
}
