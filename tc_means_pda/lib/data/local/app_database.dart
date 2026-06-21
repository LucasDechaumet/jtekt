import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

class AppDatabase {
  const AppDatabase._();

  static const pendingPayloadsTable = 'pending_payloads';

  static Database? _database;

  static Future<Database> get instance async {
    final currentDatabase = _database;
    if (currentDatabase != null) {
      return currentDatabase;
    }

    final databasePath = await getDatabasesPath();
    final path = join(databasePath, 'tc_means.db');

    final database = await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE $pendingPayloadsTable (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            payloadJson TEXT NOT NULL,
            createdAt TEXT NOT NULL
          )
        ''');
      },
    );

    _database = database;
    return database;
  }
}
