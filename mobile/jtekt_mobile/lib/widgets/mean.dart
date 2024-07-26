import 'package:flutter/material.dart';
import 'package:jtekt_mobile/models/mean_model.dart';
import 'package:jtekt_mobile/services/api.dart';

class Mean extends StatefulWidget {
  const Mean({super.key});

  @override
  State<Mean> createState() => _MeanState();
}

class _MeanState extends State<Mean> {
  bool isInOutSelected = false;
  bool isNameSelected = false;
  bool exitSelected = false;
  bool entrySelected = false;

  Color redColor = Colors.red;
  Color greenColor = Colors.green;
  Color greyColor = Colors.grey;

  List<MeanModel> meanList = [];

  final FocusNode nameFocusNode = FocusNode();
  final FocusNode meanFocusNode = FocusNode();
  final TextEditingController nameController = TextEditingController();
  final TextEditingController meanController = TextEditingController();

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    nameController.dispose();
    meanController.dispose();
    super.dispose();
  }

  void onMeanChanged() {
    setState(() {
      meanList.add(MeanModel(
        in_out: entrySelected ? "E" : "S",
        date: DateTime.now(),
        username: nameController.text,
        meanNumber: meanController.text,
      ));
      meanController.clear();
      Future.delayed(const Duration(milliseconds: 500), () {
        meanFocusNode.requestFocus();
      });
    });
  }

  void showModal(String title, String content) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(title),
          content: Text(content),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text("OK"),
            ),
          ],
        );
      },
    );
  }

  void showRemoveModal(MeanModel mean) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text("Suppression"),
          content: Text(
              "Voulez-vous supprimer ce moyen de la liste : ${mean.meanNumber} ?"),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text("Annuler"),
            ),
            TextButton(
              onPressed: () {
                deleteMean(mean);
                Navigator.of(context).pop();
              },
              child: const Text("Supprimer"),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          flex: 1,
          child: Container(
            color: Colors.white,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                ElevatedButton(
                  onPressed: entryButton,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: !isInOutSelected || entrySelected
                        ? greenColor
                        : greyColor,
                    fixedSize: !isInOutSelected
                        ? const Size(125, 75)
                        : const Size(90, 40),
                  ),
                  child: const Text(
                    "Entrée",
                    style: TextStyle(color: Colors.white),
                  ),
                ),
                ElevatedButton(
                  onPressed: exitButton,
                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                        !isInOutSelected || exitSelected ? redColor : greyColor,
                    fixedSize: !isInOutSelected
                        ? const Size(125, 75)
                        : const Size(90, 40),
                  ),
                  child: const Text(
                    "Sortie",
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
        ),
        if (isInOutSelected)
          Expanded(
            flex: 5,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: TextField(
                    onTap: cancel,
                    focusNode: nameFocusNode,
                    controller: nameController,
                    decoration: InputDecoration(
                      focusedBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                            color: entrySelected ? greenColor : redColor,
                            width: 4),
                      ),
                      border: const OutlineInputBorder(),
                      labelText: ("Utilisateur"),
                      enabledBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: greyColor, width: 2),
                      ),
                    ),
                    style: const TextStyle(fontSize: 18),
                    onSubmitted: (_) {
                      setState(() {
                        isNameSelected = true;
                      });
                      Future.delayed(const Duration(milliseconds: 500), () {
                        meanFocusNode.requestFocus();
                      });
                    },
                  ),
                ),
                const SizedBox(height: 10),
                if (isNameSelected)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    child: TextField(
                      focusNode: meanFocusNode,
                      controller: meanController,
                      decoration: InputDecoration(
                        focusedBorder: OutlineInputBorder(
                          borderSide: BorderSide(
                            color: entrySelected ? greenColor : redColor,
                            width: 4,
                          ),
                        ),
                        border: const OutlineInputBorder(),
                        labelText: ("Moyen"),
                        enabledBorder: OutlineInputBorder(
                          borderSide: BorderSide(color: greyColor, width: 2),
                        ),
                      ),
                      style: const TextStyle(fontSize: 18),
                      onSubmitted: (_) {
                        onMeanChanged();
                      },
                    ),
                  ),
                const SizedBox(height: 20),
                Expanded(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.vertical,
                    child: Column(
                      children: meanList
                          .map((mean) => ListTile(
                                title: Text(mean.username),
                                subtitle: Text(mean.meanNumber),
                                trailing: GestureDetector(
                                  onTap: () {
                                    showRemoveModal(mean);
                                  },
                                  child: const Icon(Icons.delete),
                                ),
                              ))
                          .toList(),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                if (isNameSelected)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      ElevatedButton(
                        onPressed: cancel,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                        ),
                        child: const Text(
                          "Changer de nom d'utilisateur",
                          style: TextStyle(color: Colors.white),
                        ),
                      ),
                      ElevatedButton(
                        onPressed: validation,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                        ),
                        child: Text(
                          "Valider (${meanList.length})",
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                const SizedBox(height: 20),
              ],
            ),
          ),
      ],
    );
  }

  void entryButton() {
    if (meanList.isNotEmpty) {
      showModal("Attention",
          "Vous devez valider avant de changer de mode Entrée ou Sortie.");
      return;
    }
    setState(() {
      isInOutSelected = true;
      entrySelected = true;
      exitSelected = false;
    });
    nameFocusNode.requestFocus();
  }

  void exitButton() {
    if (meanList.isNotEmpty) {
      showModal("Attention",
          "Vous devez valider avant de changer de mode Entrée ou Sortie.");
      return;
    }
    setState(() {
      isInOutSelected = true;
      exitSelected = true;
      entrySelected = false;
    });
    nameFocusNode.requestFocus();
  }

  void deleteMean(MeanModel mean) {
    setState(() {
      meanList.remove(mean);
    });
  }

  void cancel() {
    setState(() {
      meanController.clear();
      nameController.clear();
      isNameSelected = false;
    });
    Future.delayed(const Duration(milliseconds: 500), () {
      nameFocusNode.requestFocus();
    });
  }

  void validation() async {
    bool success = await Api.sendData(meanList);
    if (!mounted) return;
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Données envoyées avec succès!'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content:
              Text('Brancher le PDA sur le socle pour l\'envoi des données.'),
          backgroundColor: Colors.red,
        ),
      );
    }

    meanController.clear();
    nameController.clear();
    setState(() {
      isNameSelected = false;
      isInOutSelected = false;
      entrySelected = false;
      exitSelected = false;
      meanList.clear();
    });
  }
}
