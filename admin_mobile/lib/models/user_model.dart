import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  final int id;
  final String username;
  final String email;
  @JsonKey(name: 'first_name')
  final String? firstName;
  @JsonKey(name: 'last_name')
  final String? lastName;
  @JsonKey(name: 'is_staff')
  final bool isStaff;
  @JsonKey(name: 'is_superuser')
  final bool? isSuperuser;

  UserModel({
    required this.id,
    required this.username,
    required this.email,
    this.firstName,
    this.lastName,
    required this.isStaff,
    this.isSuperuser,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);
  Map<String, dynamic> toJson() => _$UserModelToJson(this);

  String get fullName {
    if ((firstName ?? '').isNotEmpty || (lastName ?? '').isNotEmpty) {
      return '${firstName ?? ''} ${lastName ?? ''}'.trim();
    }
    return username;
  }
}

@JsonSerializable()
class LoginResponse {
  final String access;
  final String refresh;
  final UserModel user;

  LoginResponse({
    required this.access,
    required this.refresh,
    required this.user,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) => _$LoginResponseFromJson(json);
  Map<String, dynamic> toJson() => _$LoginResponseToJson(this);
}
