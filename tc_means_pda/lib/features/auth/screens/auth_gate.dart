import 'dart:async';

import 'package:flutter/material.dart';
import 'package:tc_means_pda/core/api/api_client.dart';
import 'package:tc_means_pda/features/auth/data/auth_repository.dart';
import 'package:tc_means_pda/features/auth/screens/login_screen.dart';
import 'package:tc_means_pda/features/home/home_screen.dart';
import 'package:tc_means_pda/features/settings/data/config_repository.dart';

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  late final ApiClient _apiClient;
  late final AuthRepository _authRepository;
  late final ConfigRepository _configRepository;

  bool _isAuthenticated = false;
  bool _isInitializing = true;

  @override
  void initState() {
    super.initState();
    _apiClient = ApiClient();
    _authRepository = AuthRepository(_apiClient);
    _configRepository = ConfigRepository();
    _loadSession();
  }

  @override
  void dispose() {
    _apiClient.dispose();
    super.dispose();
  }

  Future<void> _loadSession() async {
    await _apiClient.init();

    if (!mounted) {
      return;
    }

    setState(() {
      _isAuthenticated = _apiClient.hasSession;
      _isInitializing = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isInitializing) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (!_isAuthenticated) {
      return LoginScreen(
        apiClient: _apiClient,
        authRepository: _authRepository,
        configRepository: _configRepository,
        onLoginSuccess: () {
          setState(() {
            _isAuthenticated = true;
          });
        },
      );
    }

    return HomeScreen(
      apiClient: _apiClient,
      authRepository: _authRepository,
      configRepository: _configRepository,
      onLogout: () {
        unawaited(_apiClient.clearSession());
        setState(() {
          _isAuthenticated = false;
        });
      },
    );
  }
}
