import 'package:flutter/material.dart';
import 'package:tc_means_pda/core/api/api_client.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({
    super.key,
    required this.initialIp,
    required this.onSave,
    this.showScaffold = false,
    this.onLogout,
  });

  final String initialIp;
  final Future<ApiCallStatus> Function(String targetIp) onSave;
  final bool showScaffold;
  final Future<void> Function()? onLogout;

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _ipController = TextEditingController();

  bool _isSaving = false;
  bool _isLoggingOut = false;

  @override
  void initState() {
    super.initState();
    _ipController.text = widget.initialIp;
  }

  @override
  void didUpdateWidget(covariant SettingsScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialIp != widget.initialIp &&
        _ipController.text != widget.initialIp) {
      _ipController.text = widget.initialIp;
    }
  }

  @override
  void dispose() {
    _ipController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final value = _ipController.text.trim();

    setState(() {
      _isSaving = true;
    });

    final status = await widget.onSave(value);

    if (!mounted) {
      return;
    }

    setState(() {
      _isSaving = false;
    });

    switch (status) {
      case ApiCallStatus.success:
        _showMessage(
          'Adresse IP enregistrée et valide',
          const Color(0xFF16A34A),
        );
      case ApiCallStatus.invalid:
        _showMessage(
          'Adresse IP enregistrée mais invalide',
          const Color(0xFFF59E0B),
        );
      case ApiCallStatus.noConnection:
        _showMessage(
          'Adresse IP enregistrée mais pas de connexion internet',
          const Color(0xFFDC2626),
        );
    }
  }

  Future<void> _logout() async {
    final onLogout = widget.onLogout;
    if (onLogout == null) {
      return;
    }

    setState(() {
      _isLoggingOut = true;
    });

    await onLogout();
  }

  void _showMessage(String message, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final content = _SettingsContent(
      ipController: _ipController,
      isSaving: _isSaving,
      isLoggingOut: _isLoggingOut,
      showLogout: widget.onLogout != null,
      onSave: _save,
      onLogout: _logout,
    );

    if (widget.showScaffold) {
      return Scaffold(
        appBar: AppBar(title: const Text('Paramètres')),
        body: SafeArea(child: content),
      );
    }

    return content;
  }
}

class _SettingsContent extends StatelessWidget {
  const _SettingsContent({
    required this.ipController,
    required this.isSaving,
    required this.isLoggingOut,
    required this.showLogout,
    required this.onSave,
    required this.onLogout,
  });

  final TextEditingController ipController;
  final bool isSaving;
  final bool isLoggingOut;
  final bool showLogout;
  final VoidCallback onSave;
  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextField(
            controller: ipController,
            keyboardType: TextInputType.url,
            textInputAction: TextInputAction.done,
            decoration: const InputDecoration(
              labelText: 'Adresse IP cible',
              hintText: 'https://192.168.1.10:8080',
              prefixIcon: Icon(Icons.dns_rounded),
            ),
            onSubmitted: (_) => onSave(),
          ),
          const SizedBox(height: 20),
          FilledButton.icon(
            onPressed: isSaving ? null : onSave,
            style: FilledButton.styleFrom(
              minimumSize: const Size.fromHeight(54),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            icon: const Icon(Icons.save_rounded),
            label: Text(
              isSaving ? 'Vérification...' : 'Enregistrer',
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
          if (showLogout) ...[
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: isLoggingOut ? null : onLogout,
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(54),
                foregroundColor: const Color(0xFFDC2626),
                side: const BorderSide(color: Color(0xFFDC2626)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              icon: const Icon(Icons.logout_rounded),
              label: Text(
                isLoggingOut ? 'Déconnexion...' : 'Déconnexion',
                style: const TextStyle(fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
