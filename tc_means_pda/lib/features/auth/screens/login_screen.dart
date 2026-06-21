import 'package:flutter/material.dart';
import 'package:tc_means_pda/core/api/api_client.dart';
import 'package:tc_means_pda/features/auth/data/auth_repository.dart';
import 'package:tc_means_pda/features/settings/data/config_repository.dart';
import 'package:tc_means_pda/features/settings/screens/settings_screen.dart';
import 'package:tc_means_pda/shared/validators.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({
    super.key,
    required this.apiClient,
    required this.authRepository,
    required this.configRepository,
    required this.onLoginSuccess,
  });

  final ApiClient apiClient;
  final AuthRepository authRepository;
  final ConfigRepository configRepository;
  final VoidCallback onLoginSuccess;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _isLoading = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final targetIp = await widget.configRepository.getTargetIp();
    if (!mounted) {
      return;
    }

    if (targetIp.isEmpty) {
      _showMessage('Adresse IP cible non configurée', const Color(0xFFDC2626));
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final status = await widget.authRepository.login(
      targetIp: targetIp,
      username: _usernameController.text.trim(),
      password: _passwordController.text,
    );

    if (!mounted) {
      return;
    }

    setState(() {
      _isLoading = false;
    });

    switch (status) {
      case ApiCallStatus.success:
        widget.onLoginSuccess();
      case ApiCallStatus.invalid:
        _showMessage('Identifiants invalides', const Color(0xFFF59E0B));
      case ApiCallStatus.noConnection:
        _showMessage('Pas de connexion internet', const Color(0xFFDC2626));
    }
  }

  Future<void> _openSettings() async {
    final initialIp = await widget.configRepository.getTargetIp();

    if (!mounted) {
      return;
    }

    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => SettingsScreen(
          initialIp: initialIp,
          onSave: _saveTargetIp,
          showScaffold: true,
        ),
      ),
    );
  }

  Future<ApiCallStatus> _saveTargetIp(String targetIp) async {
    await widget.configRepository.saveTargetIp(targetIp);
    return widget.apiClient.getHealth(targetIp);
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('TC Means'),
        actions: [
          IconButton(
            onPressed: _openSettings,
            tooltip: 'Paramètres',
            icon: const Icon(Icons.settings_rounded),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 80),
                TextFormField(
                  controller: _usernameController,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    labelText: 'Username',
                    prefixIcon: Icon(Icons.person_rounded),
                  ),
                  validator: Validators.required,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _passwordController,
                  obscureText: true,
                  textInputAction: TextInputAction.done,
                  decoration: const InputDecoration(
                    labelText: 'Password',
                    prefixIcon: Icon(Icons.lock_rounded),
                  ),
                  validator: Validators.required,
                  onFieldSubmitted: (_) => _login(),
                ),
                const SizedBox(height: 28),
                FilledButton.icon(
                  onPressed: _isLoading ? null : _login,
                  style: FilledButton.styleFrom(
                    minimumSize: const Size.fromHeight(54),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  icon: const Icon(Icons.login_rounded),
                  label: Text(
                    _isLoading ? 'Connexion...' : 'Connecté',
                    style: const TextStyle(fontWeight: FontWeight.w700),
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
