import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

part 'backup_api_client.g.dart';

@RestApi()
abstract class BackupApiClient {
  factory BackupApiClient(Dio dio, {String baseUrl}) = _BackupApiClient;

  @GET('backup/')
  Future<dynamic> getAll();

  @POST('backup/create/')
  Future<dynamic> create();

  @MultiPart()
  @POST('backup/upload/')
  Future<dynamic> upload(@Part() List<MultipartFile> files);
}
