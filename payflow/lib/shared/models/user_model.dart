// ignore_for_file: prefer_typing_uninitialized_variables

import 'dart:convert';

class UserModel {
  final name;
  final photoURL;

  UserModel({required this.name, required this.photoURL});

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(name: map['name'], photoURL: map['photoURL']);
  }

  factory UserModel.fromJson(String json) =>
      UserModel.fromMap(jsonDecode(json));

  Map<String, dynamic> toMap() => {"name": name, "photoURL": photoURL};

  String toJson() => jsonEncode(toMap());
}
