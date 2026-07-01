import 'package:flutter/material.dart';
import 'package:tc_means_pda/core/api/api_client.dart';
import 'package:tc_means_pda/features/means/models/means_action.dart';
import 'package:tc_means_pda/features/means/screens/means_form_screen.dart';
import 'package:tc_means_pda/features/means/widgets/means_action_button.dart';
import 'package:tc_means_pda/features/pending_payloads/data/pending_payload_repository.dart';

class MeansScreen extends StatelessWidget {
  const MeansScreen({
    super.key,
    required this.targetIp,
    required this.apiClient,
    required this.pendingPayloadRepository,
    required this.onSyncRequested,
  });

  final String targetIp;
  final ApiClient apiClient;
  final PendingPayloadRepository pendingPayloadRepository;
  final Future<void> Function() onSyncRequested;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          MeansActionButton(
            action: MeansAction.entry,
            onPressed: () => _openForm(context, MeansAction.entry),
          ),
          const SizedBox(height: 120),
          MeansActionButton(
            action: MeansAction.exit,
            onPressed: () => _openForm(context, MeansAction.exit),
          ),
        ],
      ),
    );
  }

  void _openForm(BuildContext context, MeansAction action) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => MeansFormScreen(
          action: action,
          targetIp: targetIp,
          apiClient: apiClient,
          pendingPayloadRepository: pendingPayloadRepository,
          onSyncRequested: onSyncRequested,
        ),
      ),
    );
  }
}
