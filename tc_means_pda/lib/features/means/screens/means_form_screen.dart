import 'dart:async';

import 'package:flutter/material.dart';
import 'package:tc_means_pda/core/api/api_client.dart';
import 'package:tc_means_pda/features/means/models/means_action.dart';
import 'package:tc_means_pda/features/pending_payloads/data/pending_payload_repository.dart';
import 'package:tc_means_pda/shared/validators.dart';

class MeansFormScreen extends StatefulWidget {
  const MeansFormScreen({
    super.key,
    required this.action,
    required this.targetIp,
    required this.apiClient,
    required this.pendingPayloadRepository,
    required this.onSyncRequested,
  });

  final MeansAction action;
  final String targetIp;
  final ApiClient apiClient;
  final PendingPayloadRepository pendingPayloadRepository;
  final Future<void> Function() onSyncRequested;

  @override
  State<MeansFormScreen> createState() => _MeansFormScreenState();
}

class _MeansFormScreenState extends State<MeansFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _meansController = TextEditingController();
  final _userController = TextEditingController();

  bool _isSubmitting = false;

  @override
  void dispose() {
    _meansController.dispose();
    _userController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    final meanCode = _meansController.text.trim();
    final borrower = _userController.text.trim();
    final eventDate = DateTime.now().toUtc().toIso8601String();
    final payload = {
      'action': widget.action.name,
      'method': 'PATCH',
      'path': 'means/$meanCode/status',
      'meansCode': meanCode,
      'body': {
        'isOut': widget.action.isOut,
        'borrower': borrower,
        'eventDate': eventDate,
      },
      'utilisateur': borrower,
      'eventDate': eventDate,
      'targetIp': widget.targetIp,
      'createdAt': eventDate,
    };

    final status = widget.targetIp.isEmpty
        ? ApiCallStatus.invalid
        : await widget.apiClient.updateMeanStatus(
            targetIp: widget.targetIp,
            meanCode: meanCode,
            isOut: widget.action.isOut,
            borrower: borrower,
            eventDate: eventDate,
          );

    if (!mounted) {
      return;
    }

    if (status != ApiCallStatus.success) {
      await widget.pendingPayloadRepository.save(payload);
    }

    unawaited(widget.onSyncRequested());

    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          status == ApiCallStatus.success
              ? '${widget.action.label} envoyée'
              : '${widget.action.label} enregistrée localement',
        ),
        behavior: SnackBarBehavior.floating,
      ),
    );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.action.label)),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Icon(widget.action.icon, size: 54, color: widget.action.color),
                const SizedBox(height: 12),
                Text(
                  widget.action.label,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: widget.action.color,
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 32),
                TextFormField(
                  controller: _meansController,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    labelText: 'Means',
                    prefixIcon: Icon(Icons.qr_code_2_rounded),
                  ),
                  validator: Validators.required,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _userController,
                  textInputAction: TextInputAction.done,
                  decoration: const InputDecoration(
                    labelText: 'Utilisateur',
                    prefixIcon: Icon(Icons.person_rounded),
                  ),
                  validator: Validators.required,
                  onFieldSubmitted: (_) => _submit(),
                ),
                const SizedBox(height: 28),
                FilledButton.icon(
                  onPressed: _isSubmitting ? null : _submit,
                  style: FilledButton.styleFrom(
                    minimumSize: const Size.fromHeight(54),
                    backgroundColor: widget.action.color,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  icon: const Icon(Icons.send_rounded),
                  label: const Text(
                    'Envoyer',
                    style: TextStyle(fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
