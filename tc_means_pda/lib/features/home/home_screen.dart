import 'dart:async';

import 'package:battery_plus/battery_plus.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:tc_means_pda/core/api/api_client.dart';
import 'package:tc_means_pda/features/auth/data/auth_repository.dart';
import 'package:tc_means_pda/features/means/screens/means_screen.dart';
import 'package:tc_means_pda/features/pending_payloads/data/pending_payload_repository.dart';
import 'package:tc_means_pda/features/pending_payloads/widgets/pending_count_fab.dart';
import 'package:tc_means_pda/features/settings/data/config_repository.dart';
import 'package:tc_means_pda/features/settings/screens/settings_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({
    super.key,
    required this.apiClient,
    required this.authRepository,
    required this.configRepository,
    required this.onLogout,
  });

  final ApiClient apiClient;
  final AuthRepository authRepository;
  final ConfigRepository configRepository;
  final VoidCallback onLogout;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with WidgetsBindingObserver {
  static const _syncInterval = Duration(seconds: 30);

  late final PendingPayloadRepository _pendingPayloadRepository;
  final _battery = Battery();
  final _connectivity = Connectivity();

  StreamSubscription<BatteryState>? _batterySubscription;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;
  Timer? _syncTimer;

  int _currentIndex = 0;
  String _targetIp = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _pendingPayloadRepository = PendingPayloadRepository();
    unawaited(_init());
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _syncTimer?.cancel();
    unawaited(_batterySubscription?.cancel());
    unawaited(_connectivitySubscription?.cancel());
    _pendingPayloadRepository.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      unawaited(_syncPendingPayloads());
    }
  }

  void _saveTargetIp(String ip) {
    setState(() {
      _targetIp = ip;
    });
  }

  Future<void> _loadTargetIp() async {
    final targetIp = await widget.configRepository.getTargetIp();
    if (!mounted) {
      return;
    }
    _saveTargetIp(targetIp);
  }

  Future<void> _init() async {
    await _pendingPayloadRepository.init();
    await _loadTargetIp();
    if (!mounted) {
      return;
    }
    _startAutomaticSync();
    await _syncIfAlreadyOnlineOrCharging();
  }

  void _startAutomaticSync() {
    _syncTimer?.cancel();
    _syncTimer = Timer.periodic(_syncInterval, (_) {
      unawaited(_syncPendingPayloads());
    });

    _connectivitySubscription = _connectivity.onConnectivityChanged.listen((
      results,
    ) {
      if (_hasNetwork(results)) {
        unawaited(_syncPendingPayloads());
      }
    });

    _batterySubscription = _battery.onBatteryStateChanged.listen((state) {
      if (_isCharging(state)) {
        unawaited(_syncPendingPayloads());
      }
    });
  }

  Future<void> _syncIfAlreadyOnlineOrCharging() async {
    final connectivityResults = await _connectivity.checkConnectivity();
    final batteryState = await _battery.batteryState;

    if (_hasNetwork(connectivityResults) || _isCharging(batteryState)) {
      await _syncPendingPayloads();
    }
  }

  Future<void> _syncPendingPayloads() async {
    var targetIp = _targetIp;
    if (targetIp.isEmpty) {
      targetIp = await widget.configRepository.getTargetIp();
    }

    await _pendingPayloadRepository.sync(
      apiClient: widget.apiClient,
      targetIp: targetIp,
    );
  }

  bool _hasNetwork(List<ConnectivityResult> results) {
    return results.any((result) => result != ConnectivityResult.none);
  }

  bool _isCharging(BatteryState state) {
    return state == BatteryState.charging ||
        state == BatteryState.full ||
        state == BatteryState.connectedNotCharging;
  }

  Future<ApiCallStatus> _saveAndCheckTargetIp(String ip) async {
    await widget.configRepository.saveTargetIp(ip);
    _saveTargetIp(ip);
    return widget.apiClient.getHealth(ip);
  }

  Future<void> _logout() async {
    if (_targetIp.isNotEmpty) {
      await widget.authRepository.logout(_targetIp);
    }

    if (!mounted) {
      return;
    }

    widget.onLogout();
  }

  @override
  Widget build(BuildContext context) {
    final screens = <Widget>[
      MeansScreen(
        targetIp: _targetIp,
        apiClient: widget.apiClient,
        pendingPayloadRepository: _pendingPayloadRepository,
        onSyncRequested: _syncPendingPayloads,
      ),
      SettingsScreen(
        initialIp: _targetIp,
        onSave: _saveAndCheckTargetIp,
        onLogout: _logout,
      ),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('TC Means')),
      body: SafeArea(child: screens[_currentIndex]),
      floatingActionButton: PendingCountFab(
        countListenable: _pendingPayloadRepository.pendingCount,
        onSyncRequested: _syncPendingPayloads,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.swap_vert_rounded),
            label: 'Means',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings_rounded),
            label: 'Paramètres',
          ),
        ],
      ),
    );
  }
}
