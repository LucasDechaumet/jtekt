import 'package:tc_means_pda/core/api/api_client.dart';

class AuthRepository {
  const AuthRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<ApiCallStatus> login({
    required String targetIp,
    required String username,
    required String password,
  }) {
    return _apiClient.login(
      targetIp: targetIp,
      username: username,
      password: password,
    );
  }

  Future<ApiCallStatus> logout(String targetIp) {
    return _apiClient.logout(targetIp);
  }
}
