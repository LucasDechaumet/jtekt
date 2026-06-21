import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:tc_means_pda/features/auth/storage/session_cookie_store.dart';

enum ApiCallStatus { success, invalid, noConnection }

class ApiClient {
  static const _timeout = Duration(seconds: 5);

  ApiClient({SessionCookieStore? cookieStore})
    : _cookieStore = cookieStore ?? SessionCookieStore();

  final HttpClient _client = HttpClient();
  final SessionCookieStore _cookieStore;
  final Map<String, String> _cookies = {};

  bool get hasSession => _cookies.isNotEmpty;

  Future<void> init() async {
    final storedCookies = await _cookieStore.readCookies();
    _cookies
      ..clear()
      ..addAll(storedCookies);
  }

  Future<ApiCallStatus> getHealth(String targetIp) {
    return _send(method: 'GET', targetIp: targetIp, path: 'actuator/health');
  }

  Future<ApiCallStatus> login({
    required String targetIp,
    required String username,
    required String password,
  }) {
    return _send(
      method: 'POST',
      targetIp: targetIp,
      path: 'auth/login',
      body: {'username': username, 'password': password},
      storeCookies: true,
    );
  }

  Future<ApiCallStatus> logout(String targetIp) {
    return _send(
      method: 'POST',
      targetIp: targetIp,
      path: 'auth/logout',
      clearCookiesOnSuccess: true,
    );
  }

  Future<ApiCallStatus> updateMeanStatus({
    required String targetIp,
    required String meanCode,
    required bool isOut,
    required String borrower,
    required String eventDate,
  }) {
    return _send(
      method: 'PATCH',
      targetIp: targetIp,
      path: 'means/$meanCode/status',
      body: {'isOut': isOut, 'borrower': borrower, 'eventDate': eventDate},
    );
  }

  Future<ApiCallStatus> sendPendingPayload({
    required String targetIp,
    required Map<String, dynamic> payload,
  }) {
    final method = payload['method'];
    var path = payload['path'];
    final body = payload['body'];

    if (method is! String || path is! String) {
      return Future.value(ApiCallStatus.invalid);
    }

    final code = payload['meansCode'] ?? payload['meansId'];
    if (!path.startsWith('means/') && code is String) {
      path = 'means/$code/status';
    }

    final pendingBody = body is Map
        ? Map<String, dynamic>.from(body)
        : <String, dynamic>{};
    final borrower = payload['utilisateur'];
    if (!pendingBody.containsKey('borrower') && borrower is String) {
      pendingBody['borrower'] = borrower;
    }
    final eventDate = payload['eventDate'] ?? payload['createdAt'];
    if (!pendingBody.containsKey('eventDate') && eventDate is String) {
      pendingBody['eventDate'] = eventDate;
    }

    return _send(
      method: method,
      targetIp: targetIp,
      path: path,
      body: pendingBody.isEmpty ? null : pendingBody,
    );
  }

  Future<ApiCallStatus> _send({
    required String method,
    required String targetIp,
    required String path,
    Map<String, dynamic>? body,
    bool storeCookies = false,
    bool clearCookiesOnSuccess = false,
  }) async {
    try {
      final request = await _client
          .openUrl(method, _buildUri(targetIp, path))
          .timeout(_timeout);

      request.headers.contentType = ContentType.json;
      request.headers.set(HttpHeaders.acceptHeader, ContentType.json.mimeType);
      _attachCookies(request);

      if (body != null) {
        request.write(jsonEncode(body));
      }

      final response = await request.close().timeout(_timeout);
      await response.drain<void>();

      if (response.statusCode >= 200 && response.statusCode < 300) {
        if (storeCookies) {
          await _storeCookies(response);
        }
        if (clearCookiesOnSuccess) {
          await clearSession();
        }
        return ApiCallStatus.success;
      }

      return ApiCallStatus.invalid;
    } on SocketException {
      return _statusForNetworkFailure();
    } on TimeoutException {
      return _statusForNetworkFailure();
    } on HttpException {
      return _statusForNetworkFailure();
    } on FormatException {
      return ApiCallStatus.invalid;
    }
  }

  void _attachCookies(HttpClientRequest request) {
    if (_cookies.isEmpty) {
      return;
    }

    final cookieHeader = _cookies.entries
        .map((entry) => '${entry.key}=${entry.value}')
        .join('; ');
    request.headers.set(HttpHeaders.cookieHeader, cookieHeader);
  }

  Future<void> _storeCookies(HttpClientResponse response) async {
    final setCookieHeaders = response.headers[HttpHeaders.setCookieHeader];
    if (setCookieHeaders == null) {
      return;
    }

    for (final header in setCookieHeaders) {
      final cookie = Cookie.fromSetCookieValue(header);
      _cookies[cookie.name] = cookie.value;
    }

    await _cookieStore.saveCookies(_cookies);
  }

  Future<void> clearSession() async {
    _cookies.clear();
    await _cookieStore.clearCookies();
  }

  Future<ApiCallStatus> _statusForNetworkFailure() async {
    final hasInternet = await _hasInternetConnection();
    return hasInternet ? ApiCallStatus.invalid : ApiCallStatus.noConnection;
  }

  Future<bool> _hasInternetConnection() async {
    try {
      final addresses = await InternetAddress.lookup(
        'example.com',
      ).timeout(_timeout);
      return addresses.isNotEmpty && addresses.first.rawAddress.isNotEmpty;
    } on SocketException {
      return false;
    } on TimeoutException {
      return false;
    }
  }

  Uri _buildUri(String targetIp, String path) {
    final normalizedTarget = targetIp.trim();
    final lowerTarget = normalizedTarget.toLowerCase();
    final base =
        lowerTarget.startsWith('http://') || lowerTarget.startsWith('https://')
        ? normalizedTarget
        : 'http://$normalizedTarget';

    return Uri.parse(base).replace(path: _joinPath(Uri.parse(base).path, path));
  }

  String _joinPath(String basePath, String endpointPath) {
    final cleanBase = basePath.endsWith('/')
        ? basePath.substring(0, basePath.length - 1)
        : basePath;
    final cleanEndpoint = endpointPath.startsWith('/')
        ? endpointPath.substring(1)
        : endpointPath;

    return '$cleanBase/$cleanEndpoint';
  }

  void dispose() {
    _client.close(force: true);
  }
}
