(function() {

}());

//////Builder Functions
function TippenPageBuilder() {
    //Build page for Main Tippen Site
    if (navigator.onLine) {
        pageBuilder();
        CurrentTime = Math.floor(Date.now());
        //Get Elements from html
        formTippen = document.getElementById('Tippen');

        //Select first 15 entries from DB from current time
        dbRefCurrentGames = firebase.database().ref().child('spiele');
        dbRefCurrentGames = dbRefCurrentGames.orderByChild('timestamp');
        dbRefCurrentGames = dbRefCurrentGames.startAt(CurrentTime).limitToFirst(15);

        //Sync object changes
        dbRefCurrentGames.on('value', function(snapshot) {
            CurrentGames = snapshot.val();
            createformTippen(CurrentGames, CurrentTime)
        });
    } else {
      window.location = "/offline.html";
    }
    makeReady();
}

function ErgebnisPageBuilder() {
    //Build Page for submitting new final scores
    if (navigator.onLine) {
        pageBuilder();
        //Get form Element
        formErgebnis = document.getElementById('Ergebnis');
        CurrentTime = Math.floor(Date.now());
        //Select relevant Database
        dbRefErgebnisGames = firebase.database().ref().child('spiele');
        dbRefErgebnisGames = dbRefErgebnisGames.orderByChild('timestamp');
        dbRefErgebnisGames = dbRefErgebnisGames.endAt(CurrentTime).limitToLast(20);
        dbRefErgebnisGames.on('value', function(snapshot) {
            ErgebnisGames = snapshot.val();
            createformErgebnis(ErgebnisGames, CurrentTime);
        });
    } else {
        window.location = "/offline.html";
    }
}

function AddGamesPageBuilder() {
    //Build page for adding new games
    if (navigator.onLine) {
        pageBuilder();
        //Get Elements from html
        tableGamesinDB = document.getElementById('GamesinDB');
        formNewGame = document.getElementById('NewGame');

        //Sync Data from DB to Website
        //Create reference
        dbRefSpiele = firebase.database().ref().child('spiele');

        //Sync object changes
        dbRefSpiele.on('value', function(snapshot) {
            allGames = snapshot.val();
            AddGamesbuildingHTML(allGames);
        });
    } else {
        window.location = "/offline.html";
    }
    makeReady();
}

function OfflinePageBuilder() {
    $("#footer").load('/inc/footer.html');
    cards = localStorage.getItem('pastgames');
    pastgamesdiv = document.getElementById('pastGames');
    pastgamesdiv.innerHTML = cards;
    makeReady();
    callMasonry('grid','grid-item');
}

function ArchivPageBuilder() {
    if (navigator.onLine) {
        pageBuilder();
    } else {
        window.location = "/offline.html";
    }
    makeReady();
}

function TabellePageBuilder() {
    //Build page for adding new games
    if (navigator.onLine) {
        pageBuilder();
        //Get Elements from html
        mainTable = document.getElementById('mainTable');

        //Sync Data from DB to Website
        //Create reference
        dbRefPlayers = firebase.database().ref().child('players');

        //Sync object changes
        dbRefPlayers.on('value', function(snapshot) {
            allPlayersScores = snapshot.val();
            tabelleBuilder(allPlayersScores);
        });
    } else {
        window.location = "/offline.html";
    }
    makeReady();
}

function TippsPageBuilder() {
    //Build page for Main Tippen Site
    if (navigator.onLine) {
        pageBuilder();

        CurrentTime = Math.floor(Date.now());
        millisecs = 60000;
        //Create Timebreak between past and future
        TimeBreak = CurrentTime - (160 * millisecs);

        //Get Elements from html
        pastGames = document.getElementById('pastGames');
        futureGames = document.getElementById('futureGames');

        //Select entries for furute and current games
        dbRefFutureGames = firebase.database().ref().child('spiele');
        dbRefFutureGames = dbRefFutureGames.orderByChild('timestamp');
        dbRefFutureGames = dbRefFutureGames.startAt(TimeBreak).limitToFirst(15);
        dbRefFutureGames.on('value', function(snapshot) {
            futureGamesDB = snapshot.val();
            futureGamesBuilder(futureGamesDB, CurrentTime);
        });

        //Select entries for past games
        dbRefPastGames = firebase.database().ref().child('spiele');
        dbRefPastGames = dbRefPastGames.orderByChild('timestamp');
        dbRefPastGames = dbRefPastGames.endAt(TimeBreak).limitToFirst(25);
        dbRefPastGames.on('value', function(snapshot) {
            pastGamesDB = snapshot.val();
            pastGamesBuilder(pastGamesDB);
        });

    } else {
        window.location = "/offline.html";
    }
    makeReady();
}


//////Addgames Functions
function AddGamesbuildingHTML(allGames) {
    //Build Form NewGame
    formfields = {
        "mannschaft1": "text",
        "mannschaft2": "text",
        "wettbewerb": "text",
        "land": "text",
        "fortschritt": "text",
        "art": "text",
        "timestamp": "datetime",
        "oldtimestamp": "datetime",
        "bonuspunkte": "number",
        "length": "multiple"
    };
    var form = "";
    for (var i in formfields) {
        if (i == "length") {
            form += '<div class="input-field col s12"><select multiple id="length"><option value="" disabled selected>Choose Length</option><option value="90">90</option><option value="120">120</option><option value="11er">11er</option></select><label>Length</label></div>'
        } else if (i == "oldtimestamp") {
            form += '<div class="input-field col s12 hide"><input type="' + formfields[i] + '" id="' + i + '" name="' + i + '" /><label for="' + i + '">' + i + '</label></div>';
        } else {
            form += '<div class="input-field col s12 m6"><input class="autocomplete" type="' + formfields[i] + '" id="' + i + '" name="' + i + '" required/><label for="' + i + '">' + i + '</label></div>';
        }
        //Generate list of values for autocompletes
        autoCompletes(i);
    };
    formNewGame.innerHTML = form;

    //Build Table of exisiting Games
    var table = '<thead><tr>';
    for (var i in formfields) {
        if (i == "oldtimestamp") {} else
            table += '<th data-field="' + i + '">' + i + '</th>';
    }
    table += '</tr></thead><tbody>';

    //Request a sorted array of keys (sorted by game kickoff time)
    var sortedTimes = sortingObject('timestamp', allGames);
    for (var i = 0; i < sortedTimes.length; i++) {
        var useID = sortedTimes[i].key;
        var item = allGames[useID];
        table += '<tr>';
        for (var j in formfields) {
            if (j == "length") {
                lengthforTable = item[j];
                var lengthforTablePrint = '';
                for (var t in lengthforTable) {
                    lengthforTablePrint += lengthforTable[t] + '|';
                }
                lengthforTablePrint = lengthforTablePrint.substring(0, lengthforTablePrint.length - 1);
                table += '<td>' + lengthforTablePrint + '</td>';
            } else if (j == "timestamp") {
                table += '<td>' + new Date(item[j]).toLocaleString() + '</td>';
            } else if (j == "oldtimestamp") {} else {
                table += '<td>' + item[j] + '</td>';
            }
        }
        passID = "'" + useID + "'";
        table += '<td><input class="btn" name="edit" type="submit" value="Edit" onclick="editGames(allGames,' + passID + ')" /></td>';
        table += '<td><input class="btn" name="deleteshow' + useID + '" type="submit" value="Delete" id="deleteshow' + useID + '" onclick="showDeleteButton(' + passID + ')" /><input class="btn red" style="display: none;" name="reallydelete' + useID + '" id="reallydelete' + useID + '" type="submit" value="Really?" onclick="deleteGame(' + passID + ')"/></td>';
        table += '</tr>';
    }
    table += '</tbody>';
    tableGamesinDB.innerHTML = table;
    makeReady();
}

function autoCompletes(inputselection) {
    //This function gets an input from a form and creates the corresponding autocomplete list
    var outputSelection = inputselection;
    if (inputselection) {
        if (inputselection.substr(0, 10) === "mannschaft") {
            inputselection = "mannschaft";
        }
    }
    //Autocomplete list is requested from database
    dbResources = firebase.database().ref('resources/' + inputselection);
    dbResources.on('value', function(snapshot) {
        dbResources = snapshot.val();
        //Required javascript code is generated
        $('input#' + outputSelection).autocomplete({
            data: dbResources
        });
    });
}

function editGames(allGames, ID) {
    //insert all values into form from line in table
    var editLength = [];
    for (var i in allGames[ID].length) {
        editLength.push(allGames[ID].length[i]);
    }
    console.log(editLength);
    document.getElementById('mannschaft1').value = allGames[ID].mannschaft1;
    document.getElementById('mannschaft2').value = allGames[ID].mannschaft2;
    document.getElementById('wettbewerb').value = allGames[ID].wettbewerb;
    document.getElementById('fortschritt').value = allGames[ID].fortschritt;
    document.getElementById('art').value = allGames[ID].art;
    document.getElementById('timestamp').value = new Date(allGames[ID].timestamp).toString();
    var timeID = ID.substr(0, 13);
    timeID = parseInt(timeID);
    document.getElementById('oldtimestamp').value = new Date(timeID).toString();
    document.getElementById('bonuspunkte').value = allGames[ID].bonuspunkte;
    document.getElementById('land').value = allGames[ID].land;
    document.getElementById('length').value = editLength;
    Materialize.updateTextFields();
    $('#length').material_select();
}

function submitNewGame() {
    //Get Data from Submit Form
    var mannschaft1 = document.getElementById('mannschaft1').value;
    var mannschaft2 = document.getElementById('mannschaft2').value;
    var wettbewerb = document.getElementById('wettbewerb').value;
    var fortschritt = document.getElementById('fortschritt').value;
    var art = document.getElementById('art').value;
    var timestamp = document.getElementById('timestamp').value;
    var oldtimestamp = document.getElementById('oldtimestamp').value;
    var bonuspunkte = document.getElementById('bonuspunkte').value;
    var length = document.getElementById('length');
    var land = document.getElementById('land').value;

    //Multipleselect for length is analyzed and converted to an object
    var lengthvalues = '{';
    for (var i = 1; i < length.options.length; i++) {
        if (length.options[i].selected) {
            lengthvalues += '"' + length.options[i].value + '":"' + length.options[i].value + '",';
        }
    }
    lengthvalues = lengthvalues.substring(0, lengthvalues.length - 1);
    lengthvalues += '}';
    length = lengthvalues;

    //Create Identification for Object in DB and create timestamp
    oldtimestamp = Date.parse(oldtimestamp);
    datevalue = Date.parse(timestamp);
    //Check if a game is edited or a new game is created
    if (oldtimestamp > 1) {
        console.log("Editing existing game");
        var identification = oldtimestamp.toString() + mannschaft1.replace(/\W+/g, '') + mannschaft2.replace(/\W+/g, '');
    } else {
        var identification = datevalue.toString() + mannschaft1.replace(/\W+/g, '') + mannschaft2.replace(/\W+/g, '');
    }

    //Create JSON Object
    var newEntry = '{  "' + identification + '": {  "art": "' + art + '",        "bonuspunkte": ' + bonuspunkte + ',        "fortschritt": "' + fortschritt + '", "length":' + length + ', "land":"' + land + '",        "mannschaft1": "' + mannschaft1 + '",        "mannschaft2": "' + mannschaft2 + '",    "timestamp": ' + datevalue + ',      "wettbewerb": "' + wettbewerb + '"}}';
    var newEntry = jQuery.parseJSON(newEntry);
    var onComplete = function(error) {
        if (error) {
            console.log('Synchronization failed');
        } else {
            console.log('Synchronization succeeded');
        }
    };
    //Send Object to DB
    dbRefSpiele.update(newEntry, onComplete);
};

function showDeleteButton(useID) {
    //Show Delete Button on AddGames Page
    $("#deleteshow" + useID).hide();
    $("#reallydelete" + useID).show();
}

function deleteGame(ID) {
    //Delete Game on AddGames Page
    dbRefRemoveLine = firebase.database().ref('spiele/' + ID);
    dbRefRemoveLine.remove();
}


//////Main Page, Tippen Functions
function createformTippen(CurrentGames, CurrentTime) {
    //Create the form for submitting new tipps
    formTippenfields = {
        "mannschaft1": "number",
        "mannschaft2": "number",
        "length": "select",
        "winner": "select"
    }
    dbWettbewerb = firebase.database().ref();
    dbWettbewerb.on('value', function(snapshot) {
        dbPlayers = snapshot.child('players').val();
        dbWettbewerb = snapshot.child('resources/wettbewerb').val();
        dbMannschaft = snapshot.child('resources/mannschaft').val();
        countPlayers = 0;
        printedCards = 0;
        var username = localStorage.getItem('username');
        cards = '<div class="row">';
        cards += '<div class="col s12 m12"><div class="card"><div class="card-content"><p><label>Name</label><select id="player" required><option value="" disabled selected>Bitte auswählen</option>';
        for (var p in dbPlayers) {
            //Creating dropdown options and counting number of players
            cards += '<option value="' + p + '"';
            //Preselects username if cookie included right username
            if (username == p) {
                cards += 'selected';
            }
            cards += '>' + p + '</option>';
            countPlayers += 1;
        }
        cards += '</select></p></div></div></div>';
        cards += '</div>';
        cards += '<div  class="row grid">';
        //Request a sorted array of keys (sorted by game kickoff time)
        var sortedTimes = sortingObject('timestamp', CurrentGames);
        for (var i = 0; i < sortedTimes.length; i++) {
            var useID = sortedTimes[i].key;
            var item = CurrentGames[useID];
            var countTipps = 0;
            var namePlayerTipps = "";
            for (j in dbPlayers) {
                //Checking if every player has submitted a tipp
                if (dbPlayers[j][useID]) {
                    countTipps += 1;
                    namePlayerTipps += j + ", ";
                }
            }
            namePlayerTipps = namePlayerTipps.substring(0, namePlayerTipps.length - 2);
            //card is opened
            cards += '<div class="col s12 m6 grid-item"><div class = "card" style = "background-color:#fff" ><div class = "card-content" >';
            cards += '<span class="badge"><img src="' + dbWettbewerb[item['wettbewerb']] + '" alt="' + item['wettbewerb'] + '" class="responsive-img" style="height:30px"/></span>';
            cards += '<p style="font-size:larger; font-weight:bold"><img src="' + dbMannschaft[item['mannschaft1']] + '" alt="Mannschaft1" class="circle responsive-img" style="height: 14px; margin-right: 7px;" />' + item['mannschaft1'] + '</p>';
            cards += '<p style="font-size:larger; font-weight:bold"><img src="' + dbMannschaft[item['mannschaft2']] + '" alt="Mannschaft1" class="circle responsive-img" style="height: 14px; margin-right: 7px;" />' + item['mannschaft2'] + '</p>';
            cards += '<p style="font-size:smaller; font-weight:inherit; color:#999">' + item['wettbewerb'] + ' ' + item['fortschritt'] + ' ' + item['art'] + ' am ' + new Date(item['timestamp']).toLocaleDateString() + ' um ' + new Date(item['timestamp']).toLocaleTimeString() + ' Uhr</p>';
            if (countTipps != countPlayers) {
                m1 = item['mannschaft1'];
                m2 = item['mannschaft2'];
                transuseID = "'"+useID+"'";
                transm1 = "'"+m1+"'";
                transm2 = "'"+m2+"'";
                cards += '<div class="input-field col s6 m6"><input id="' + useID + 'M1" type="number" class="validate" onchange="changeWinnerSelect('+transuseID+','+transm1+','+transm2+')"><label for="' + useID + 'M1">Heim</label></div>';
                cards += '<div class="input-field col s6 m6"><input id="' + useID + 'M2" type="number" class="validate" onchange="changeWinnerSelect('+transuseID+','+transm1+','+transm2+')"><label for="' + useID + 'M2">Gast</label></div>';
                //Optionen für Länge werden erstellt
                length = item['length'];
                var lengthPrint = '';
                var lengthNeeded = 0;
                for (var t in length) {
                    lengthNeeded += 1;
                    lengthPrint += '<option value="' + length[t] + '">' + length[t] + '</option>';
                }
                if (lengthNeeded > 1) {
                    //Select für Länge wird erstellt
                    cards += '<div class="input-field col s6"><select id="' + useID + 'Length"><option value="" disabled selected>Länge</option>';
                    cards += lengthPrint;
                    cards += '</select></div>';
                    //Select für Sieger wird erstellt
                    cards += '<div class="input-field col s6"><select id="' + useID + 'Winner"><option value="" disabled selected>Sieger</option>';
                    cards += '<option value="' + m1 + '">' + m1 + '</option>'
                    cards += '<option value="' + m2 + '">' + m2 + '</option>'
                    cards += '</select></div>';
                }
            }
            passID = "'" + useID + "'";
            if (countTipps > 0) {
                cards += '<p style="font-size:smaller; font-weight:inherit; color:#999">Getippt von: ' + namePlayerTipps + '</p>';
            } else {
                cards += '<p style="font-size:smaller; font-weight:inherit; color:#999">Bisher noch keine Tipps</p>';
            }
            cards += '</div></div></div>';
            printedCards += 1;
        }
        cards += '</div>'
        formTippen.innerHTML = cards;
        console.log(printedCards);
        makeReady();
        callMasonry();
    })
}

function submitTipps(CurrentGames) {
    var playerName = document.getElementById('player').value;
    var successSubmits = 0;
    if (playerName) {
        localStorage.setItem('username', playerName);
        dbRefPlayers = firebase.database().ref('players/' + playerName);
        var countloops = 0;
        var entries = {};
        for (var i in CurrentGames) {
            countloops += 1;
            console.log(i);
            abgabeZeit = Math.floor(Date.now());
            console.log($('#' + i + 'M1').length);
            if ($('#' + i + 'M1').length && (abgabeZeit <= CurrentGames[i]['timestamp'])) {
                //Es wird kontrolliert, ob ein Spiel rechtzeitig getippt worden ist
                //For every possible game that has been displayed the values are fetched
                var scoreM1 = document.getElementById(i + 'M1').value;
                var scoreM2 = document.getElementById(i + 'M2').value;
                if (scoreM1 && scoreM2) {
                    //Wenn beide Mannschaften eine Toranzahl erhalten haben, wird der Tipp verarbeitet
                    var newEntry = '{  "scoreM1": ' + scoreM1 + ',        "scoreM2": ' + scoreM2;
                    koGame = CurrentGames[i]['length'];
                    var iskoGame = 0;
                    for (var t in koGame) {
                        iskoGame += 1;
                    }
                    //Es wird kontrolliert, ob es sich um ein ko-Spiel handelt (mehr als eine Option für die Länge des Spiels)
                    if (iskoGame > 1) {
                        var length = document.getElementById(i + 'Length').value;
                        var winner = document.getElementById(i + 'Winner').value;
                        newEntry += ',  "length":"' + length + '", "winner":"' + winner + '"';
                    }
                    newEntry += '}';
                    var newTipp = jQuery.parseJSON(newEntry);
                    entries[i] = newTipp;
                    successSubmits += 1;
                    var onComplete = function(error) {
                        //function is called when tipps are submitted
                        if (error) {
                            console.log('Synchronization failed');
                            displayToast("Serverfehler", "red");
                        } else {
                            console.log('Synchronization succeeded');
                            if (successSubmits == 1) {
                                document.getElementById('toast').innerHTML = successSubmits + ' Spiel getippt';
                            } else {
                                document.getElementById('toast').innerHTML = successSubmits + ' Spiele getippt';
                            }
                        }
                    };
                    //Send Object to DB
                    console.log(newEntry);
                    //console.log(countloops);
                }
            }
        }
        console.log(entries);
        dbRefPlayers.update(entries, onComplete);
        displayToast("Stimmt alles?", "green");
    } else {
        displayToast("Namen angeben!", "red");
    }
}

function changeWinnerSelect(useID, m1, m2) {
    var winnerSelect = document.getElementById(useID + "Winner");
    console.log(m1);
    if (winnerSelect) {
      //Check if a Winner actually has to be selected
        scoreMannschaft1 = document.getElementById(useID + 'M1').value;
        scoreMannschaft2 = document.getElementById(useID + 'M2').value;
        if (scoreMannschaft1 && scoreMannschaft2) {
          //Check if there are scores are entred for both teams before comparison is  started
            if (scoreMannschaft1 > scoreMannschaft2) {
                winnerSelect.value = m1;
            } else if (scoreMannschaft1 < scoreMannschaft2) {
                winnerSelect.value = m2;
            }
            $('#'+useID + 'Winner').material_select();
        }
    }
}


/////Submit Final Result Functions
function createformErgebnis(ErgebnisGames, CurrentTime) {
    //Create the form for submitting new tipps
    dbWettbewerb = firebase.database().ref();
    dbWettbewerb.on('value', function(snapshot) {
        dbPlayers = snapshot.child('players').val();
        dbWettbewerb = snapshot.child('resources/wettbewerb').val();
        dbMannschaft = snapshot.child('resources/mannschaft').val();
        dbRefScoresCheck = snapshot.child('scores').val();
        var cards = "";
        cards += '<div class="row grid">';
        //Request a sorted array of keys (sorted by game kickoff time)
        var sortedTimes = sortingObject('timestamp', ErgebnisGames);
        var numberofCards = 4;
        var printedCards = 0;
        for (var i = 0; i < sortedTimes.length; i++) {
            var useID = sortedTimes[i].key;
            var item = ErgebnisGames[useID];
            if (printedCards == numberofCards) {
                break;
            } else if (dbRefScoresCheck[useID]) {
                continue;
            }

            //card is opened
            cards += '<div class="col s12 m6 grid-item"><div class = "card" style = "background-color:#fff" ><div class = "card-content" >';
            cards += '<span class="badge"><img src="' + dbWettbewerb[item['wettbewerb']] + '" alt="' + item['wettbewerb'] + '" class="responsive-img" style="height:30px"/></span>';
            cards += '<p style="font-size:larger; font-weight:bold"><img src="' + dbMannschaft[item['mannschaft1']] + '" alt="Mannschaft1" class="circle responsive-img" style="height: 14px; margin-right: 7px;" />' + item['mannschaft1'] + '</p>';
            cards += '<p style="font-size:larger; font-weight:bold"><img src="' + dbMannschaft[item['mannschaft2']] + '" alt="Mannschaft1" class="circle responsive-img" style="height: 14px; margin-right: 7px;" />' + item['mannschaft2'] + '</p>';
            cards += '<p style="font-size:smaller; font-weight:inherit; color:#999">' + item['wettbewerb'] + ' ' + item['fortschritt'] + ' ' + item['art'] + ' am ' + new Date(item['timestamp']).toLocaleDateString() + ' um ' + new Date(item['timestamp']).toLocaleTimeString() + ' Uhr</p>';
            cards += '<div class="input-field col s6 m6"><input id="' + useID + 'M1" type="number" class="validate"><label for="' + useID + 'M1">Heim</label></div>';
            cards += '<div class="input-field col s6 m6"><input id="' + useID + 'M2" type="number" class="validate"><label for="' + useID + 'M2">Gast</label></div>';
            //Optionen für Länge werden erstellt
            length = item['length'];
            var lengthPrint = '';
            var lengthNeeded = 0;
            for (var t in length) {
                lengthNeeded += 1;
                lengthPrint += '<option value="' + length[t] + '">' + length[t] + '</option>';
            }
            if (lengthNeeded > 1) {
                //Select für Länge wird erstellt
                cards += '<div class="input-field col s6"><select id="' + useID + 'Length"><option value="" disabled selected>Länge</option>';
                cards += lengthPrint;
                cards += '</select></div>';
                //Select für Sieger wird erstellt
                cards += '<div class="input-field col s6"><select id="' + useID + 'Winner"><option value="" disabled selected>Sieger</option>';
                cards += '<option value="' + item['mannschaft1'] + '">' + item['mannschaft1'] + '</option>'
                cards += '<option value="' + item['mannschaft2'] + '">' + item['mannschaft2'] + '</option>'
                cards += '</select></div>';
                cards += '<div id="' + useID + 'bonuspunkte" value="' + item['bonuspunkte'] + '" class="hidden"></div>';
            }
            passID = "'" + useID + "'";
            cards += '<p style="font-size:smaller; font-weight:inherit; color:#999">Bisher noch kein Ergebnis eingetragen</p>';
            cards += '</div></div></div>';
            printedCards += 1;
        }
        if (printedCards == 0) {
            cards += '<div class="col s12 m6 grid-item"><div class = "card" style = "background-color:#fff" ><div class = "card-content" >Keine fehlenden Ergebnisse</div></div></div>';
            document.getElementById('submitbutton').className += ' disabled';
        }
        cards += '</div>'
        formErgebnis.innerHTML = cards;
        makeReady();
        callMasonry();
    })
}

function submitErgebnis(ErgebnisGames) {
    var successSubmits = 0;
    for (var i in ErgebnisGames) {
        if ($('#' + i + 'M1').length) {
            //For every possible game that has been displayed the values are fetched
            var scoreM1 = document.getElementById(i + 'M1').value;
            var scoreM2 = document.getElementById(i + 'M2').value;
            if (scoreM1 && scoreM2) {
                //Wenn beide Mannschaften eine Toranzahl erhalten haben, wird das Ergebnis verarbeitet
                console.log(i + " Ergebnis wurde eingetragen");
                var newEntry = '{  "scoreM1": ' + scoreM1 + ',        "scoreM2": ' + scoreM2;
                koGame = ErgebnisGames[i]['length'];
                var iskoGame = 0;
                for (var t in koGame) {
                    iskoGame += 1;
                }
                //Es wird kontrolliert, ob es sich um ein ko-Spiel handelt
                if (iskoGame > 1) {
                    var length = document.getElementById(i + 'Length').value;
                    var winner = document.getElementById(i + 'Winner').value;
                    if (length == "" || winner == "") {
                        continue;
                    }
                    newEntry += ',  "length":"' + length + '", "winner":"' + winner + '"';
                    //Variablen werden zur Punktevergabe übergeben
                    var bonuspunkte = document.getElementById(i + 'bonuspunkte').getAttribute('value');
                    calcPointsSpecial(i, scoreM1, scoreM2, length, winner, bonuspunkte);
                } else {
                    //Variablen werden zur Punkteübergabe übergeben
                    calcPoints(i, scoreM1, scoreM2);
                }
                newEntry += '}';
                var newEntry = jQuery.parseJSON(newEntry);
                var newTipp = jQuery.parseJSON(newEntry);
                entries[i] = newTipp;
                successSubmits += 1;
                dbRefScores = firebase.database().ref('scores');

                var onComplete = function(error) {
                    //function is called when tipps are submitted
                    if (error) {
                        console.log('Synchronization failed');
                        displayToast("Serverfehler", "red");
                    } else {
                        successSubmits += 1;
                        console.log('Synchronization succeeded');
                        if (successSubmits == 1) {
                            document.getElementById('toast').innerHTML = successSubmits + ' Ergebnis eingetragen';
                        } else {
                            document.getElementById('toast').innerHTML = successSubmits + ' Ergebnisse eingetragen';
                        }
                    }
                };
            }
        }
    }
    //Send Object to DB
    dbRefScores.update(entries, onComplete);
    displayToast("Stimmt alles?", "green");
}

function calcPoints(submittedGameID, scoreM1, scoreM2) {
    //Points for Games without length option are calculated
    dbAllPlayers = firebase.database().ref().child('players');
    dbAllPlayers.once('value').then(function(snapshot) {
        dbPlayers = snapshot.val();
        for (var p in dbPlayers) {
            //Looping for all players in the game
            //Checking if the player has submitted a Tipp
            if (dbPlayers[p][submittedGameID]) {
                var playerScore = dbPlayers[p];
                var playerScoreM1 = playerScore[submittedGameID]["scoreM1"];
                var playerScoreM2 = playerScore[submittedGameID]["scoreM2"];
                var totalpoints = 0;
                //New JSON is created to overwrite current entry
                var submitPoints = '{  "' + submittedGameID + '": {  "scoreM1": ' + playerScoreM1 + ',        "scoreM2": ' + playerScoreM2;
                if (playerScoreM1 == scoreM1 && playerScoreM2 == scoreM2) {
                    //If Tipp was 100% accurate
                    totalpoints += 2;
                }
                if ((playerScoreM1 > playerScoreM2 && scoreM1 > scoreM2) || (playerScoreM1 < playerScoreM2 && scoreM1 < scoreM2) || (playerScoreM1 == playerScoreM2 && scoreM1 == scoreM2)) {
                    //If direction of Tipp was accurate
                    totalpoints += 1;
                }
                submitPoints += ',"totalpoints":' + totalpoints;
                submitPoints += '}}';
                var submitPoints = jQuery.parseJSON(submitPoints);
                dbRefPlayers = firebase.database().ref('players/' + p);
                dbRefPlayers.update(submitPoints);
            } else {
                //What happens when no Tipp has been submitted
                console.log(p + " hat nicht getippt");
                var totalpoints = -1;
                var playerScoreM1 = 0;
                var playerScoreM2 = 0;
                //New JSON is created to overwrite current entry
                var submitPoints = '{  "' + submittedGameID + '": {  "scoreM1": ' + playerScoreM1 + ',        "scoreM2": ' + playerScoreM2;
                if (playerScoreM1 == scoreM1 && playerScoreM2 == scoreM2) {
                    //If Tipp was 100% accurate
                    totalpoints += 2;
                }
                if ((playerScoreM1 > playerScoreM2 && scoreM1 > scoreM2) || (playerScoreM1 < playerScoreM2 && scoreM1 < scoreM2) || (playerScoreM1 == playerScoreM2 && scoreM1 == scoreM2)) {
                    //If direction of Tipp was accurate
                    totalpoints += 1;
                }
                submitPoints += ',"totalpoints":' + totalpoints;
                submitPoints += ',"nontipp":' + true;
                submitPoints += '}}';
                var submitPoints = jQuery.parseJSON(submitPoints);
                console.log(submitPoints);
                dbRefPlayers = firebase.database().ref('players/' + p);
                dbRefPlayers.update(submitPoints);
            }
        }
    });
}

function calcPointsSpecial(submittedGameID, scoreM1, scoreM2, length, winner, bonuspunkte) {
    //Points for Games with Bonuspoints are calculated
    dbAllPlayers = firebase.database().ref().child('players');
    dbRefSpiele = firebase.database().ref().child('spiele');
    dbAllPlayers.once('value').then(function(snapshot) {
        dbPlayers = snapshot.val();
        console.log("submittedGameID:" + submittedGameID);
        dbRefSpiele.once('value').then(function(snapshot) {
            dbSpiele = snapshot.val();
            for (var p in dbPlayers) {
                //Looping for all players in the game
                //Checking if the player has submitted a Tipp
                if (dbPlayers[p][submittedGameID]) {
                    var playerScore = dbPlayers[p];
                    var playerScoreM1 = playerScore[submittedGameID]["scoreM1"];
                    var playerScoreM2 = playerScore[submittedGameID]["scoreM2"];
                    var playerLength = playerScore[submittedGameID]["length"];
                    var playerWinner = playerScore[submittedGameID]["winner"];
                    var totalpoints = 0;
                    //New JSON is created to overwrite current entry
                    var submitPoints = '{  "' + submittedGameID + '": {  "scoreM1": ' + playerScoreM1 + ',        "scoreM2": ' + playerScoreM2;
                    if (playerScoreM1 == scoreM1 && playerScoreM2 == scoreM2) {
                        //If Tipp was 100% accurate
                        totalpoints += 2;
                    }
                    if ((playerScoreM1 > playerScoreM2 && scoreM1 > scoreM2) || (playerScoreM1 < playerScoreM2 && scoreM1 < scoreM2) || (playerScoreM1 == playerScoreM2 && scoreM1 == scoreM2)) {
                        //If direction of Tipp was accurate
                        totalpoints += 1;
                    }
                    if (playerLength == length) {
                        totalpoints += 1;
                    }
                    if (playerWinner == winner) {
                        totalpoints += parseInt(bonuspunkte);
                    }
                    submitPoints += ',  "length":"' + playerLength + '", "winner":"' + playerWinner + '"';
                    submitPoints += ',"totalpoints":' + totalpoints;
                    submitPoints += '}}';
                    var submitPoints = jQuery.parseJSON(submitPoints);
                    console.log(p);
                    console.log(submitPoints);
                    dbRefPlayers = firebase.database().ref('players/' + p);
                    dbRefPlayers.update(submitPoints);
                } else {
                    //What happens when no Tipp has been submitted
                    winnerOption1 = dbSpiele[submittedGameID]["mannschaft1"];
                    winnerOption2 = dbSpiele[submittedGameID]["mannschaft2"];
                    var playerScore = dbPlayers[p];
                    var playerScoreM1 = 0;
                    var playerScoreM2 = 0;
                    var playerLength = "";
                    if (Math.random() > 0.5) {
                        var playerWinner = winnerOption1;
                    } else {
                        var playerWinner = winnerOption2;
                    }
                    var totalpoints = 0;
                    //New JSON is created to overwrite current entry
                    var submitPoints = '{  "' + submittedGameID + '": {  "scoreM1": ' + playerScoreM1 + ',        "scoreM2": ' + playerScoreM2;
                    if (playerScoreM1 == scoreM1 && playerScoreM2 == scoreM2) {
                        //If Tipp was 100% accurate
                        totalpoints += 2;
                    }
                    if ((playerScoreM1 > playerScoreM2 && scoreM1 > scoreM2) || (playerScoreM1 < playerScoreM2 && scoreM1 < scoreM2) || (playerScoreM1 == playerScoreM2 && scoreM1 == scoreM2)) {
                        //If direction of Tipp was accurate
                        totalpoints += 1;
                    }
                    if (playerLength == length) {
                        totalpoints += 1;
                    }
                    if (playerWinner == winner) {
                        totalpoints += parseInt(bonuspunkte);
                    }
                    submitPoints += ',  "length":"' + playerLength + '", "winner":"' + playerWinner + '"';
                    submitPoints += ',"totalpoints":' + totalpoints;
                    submitPoints += '}}';
                    var submitPoints = jQuery.parseJSON(submitPoints);
                    console.log(p + " - nicht getippt");
                    console.log(submitPoints);
                    dbRefPlayers = firebase.database().ref('players/' + p);
                    dbRefPlayers.update(submitPoints);
                }
            }
        });
    });
}


//////Build Table Functions
function tabelleBuilder(allPlayersScores) {
    tableHTML = '<table class="striped">';
    tableHTML += '<thead><tr><th data-field="platz">Platz</th><th data-field="name">Name</th><th data-field="points">Punkte</th></tr></thead>';
    tableHTML += '<tbody>';
    var table = [];
    for (var p in allPlayersScores) {
        //Looping over all Players
        var singlePlayerScores = allPlayersScores[p];
        var singlePlayerPoints = 0;
        for (var s in singlePlayerScores) {
            //Looping over all games for every player
            if (singlePlayerScores[s]['totalpoints'] > 0 || singlePlayerScores[s]['totalpoints'] < 0) {
                //Check if game was already played & the player has received points and then sum up all points
                singlePlayerPoints += singlePlayerScores[s]['totalpoints'];
            }
        }
        //Push player and points to array (points are named timestamp just to used the same ordering function and are negative to reverse sorting)
        table.push({
            name: p,
            timestamp: -singlePlayerPoints
        })
    }
    //Sorting table
    var sortedTable = sortingObject('timestamp', table);
    var platz = 0;
    var previousPlayerPoints = 0;
    for (var i = 0; i < sortedTable.length; i++) {
        var useID = sortedTable[i].key;
        var item = table[useID];
        var myPoints = -item['timestamp'];
        if (previousPlayerPoints != myPoints) {
            //Check if Player has more points than previous Player (unequal is enough as the array has been sorted anyways)
            //If player has less points, he will be ranked down
            platz += 1;
        }
        //Building lines of the table
        if (localStorage.getItem('username') == item['name']) {
            tableHTML += '<tr style="color: #3f51b5; font-weight: bold">';
        } else {
            tableHTML += '<tr>';
        }
        tableHTML += '<td>' + platz + '.</td>';
        tableHTML += '<td>' + item['name'] + '</td>';
        tableHTML += '<td>' + myPoints + '</td>';
        tableHTML += '</tr>';
        previousPlayerPoints = myPoints;
    }
    tableHTML += '</tbody></table>';
    mainTable.innerHTML = tableHTML;
    makeReady();
}


//////Build Tipps Anzeigen Functions
function pastGamesBuilder(pastGamesDB) {
    var sortedTimes = sortingReverseObject('timestamp', pastGamesDB);
    var pastGamesArray = [];
    var countPlayers = 0;
    dbScores = firebase.database().ref().child('scores');
    dbResources = firebase.database().ref().child('resources');
    cards = '';
    dbResources.once('value').then(function(snapshot) {
        dbWettbewerb = snapshot.child('wettbewerb').val();
        dbMannschaft = snapshot.child('mannschaft').val();
        dbScores.on('value', function(snapshot) {
            dbScores = snapshot.val();
            dbPlayers = firebase.database().ref().child('players');
            dbPlayers.on('value', function(snapshot) {
                dbPlayers = snapshot.val();
                for (var p in dbPlayers) {
                    //Counting number of players
                    countPlayers += 1;
                }

                for (var i = 0; i < sortedTimes.length; i++) {
                    //Looping through all games
                    //Defining all Variabeles
                    var useID = sortedTimes[i].key;
                    var item = pastGamesDB[useID];
                    var countTipps = 0;
                    var namePlayersLine = "<thead><tr>";
                    var tippPlayersLine = "";
                    var lengthPlayersLine = "";
                    var winnerPlayersLine = "";
                    var pointsPlayersLine = "";
                    for (j in dbPlayers) {
                        //Checking if every player has submitted a tipp
                        if (dbPlayers[j][useID]) {
                            countTipps += 1;
                            //create playersline for table
                            namePlayersLine += "<th>" + j + "</th>";
                            tippPlayersLine += '<td>' + dbPlayers[j][useID].scoreM1 + ':' + dbPlayers[j][useID].scoreM1 + '</td>';
                            if (dbPlayers[j][useID].length == "") {
                                lengthPlayersLine += '<td style="font-size:smaller;">Non-Tipp</td>';
                            } else {
                                lengthPlayersLine += '<td>' + dbPlayers[j][useID].length + '</td>';
                            }
                            winnerPlayersLine += '<td style="font-size:smaller;">' + dbPlayers[j][useID].winner + '</td>';
                            n = dbPlayers[j][useID].totalpoints;
                            pointsPlayersLine += '<td  style="border-top: 1px solid #d0d0d0">' + (n <= 0 ? '' : '+') + n + '</td>';
                        }
                    }
                    namePlayersLine += "</thead></tr>";
                    if (countTipps == countPlayers) {
                        //Checks if every player has submitted a tipp and then proceeds to create card
                        cards += '<div class="col s12 m6 grid-item"><div class = "card" style = "background-color:#fff" ><div class = "card-content" >';
                        cards += '<span class="badge"><img src="' + dbWettbewerb[item['wettbewerb']] + '" alt="' + item['wettbewerb'] + '" class="responsive-img" style="height:30px"/></span>';
                        cards += '<p style="font-size:larger; font-weight:bold"><img src="' + dbMannschaft[item['mannschaft1']] + '" alt="Mannschaft1" class="responsive-img" style="height: 14px; margin-right: 7px;" />' + item['mannschaft1'] + '</p>';
                        cards += '<p style="font-size:larger; font-weight:bold"><img src="' + dbMannschaft[item['mannschaft2']] + '" alt="Mannschaft1" class="responsive-img" style="height: 14px; margin-right: 7px;" />' + item['mannschaft2'] + '</p>';
                        cards += '<p style="font-size:smaller; font-weight:inherit; color:#999">' + item['wettbewerb'] + ' ' + item['fortschritt'] + ' ' + item['art'] + ' am ' + new Date(item['timestamp']).toLocaleDateString() + ' um ' + new Date(item['timestamp']).toLocaleTimeString() + ' Uhr</p>';
                        if (dbScores[useID]) {
                            //Checks if there already are final scores for the game
                            cards += '<div class="divider" style="margin-bottom: 2px;"></div>';
                            cards += '<p class="center" style="font-size:larger; font-weight:bold">' + dbScores[useID].scoreM1 + ':' + dbScores[useID].scoreM2 + '</p>';
                            if (dbScores[useID].length) {
                                if (dbScores[useID].length == "11er") {
                                    displayLength = '(11er)';
                                } else {
                                    displayLength = '(' + dbScores[useID].length + ' mins)';
                                }
                                cards += '<p class="center" style="font-size:smaller; font-weight:inherit;">' + dbScores[useID].winner + ' ' + displayLength + '</p>';
                            }
                        }
                        cards += '<table class="centered" style="table-layout:fixed">';
                        cards += namePlayersLine;
                        cards += '<tbody>';
                        cards += '<tr>' + tippPlayersLine + '</tr>';
                        //Check if additional information (length, winner) has to be displayed
                        length = item['length'];
                        var lengthNeeded = 0;
                        for (var t in length) {
                            lengthNeeded += 1;
                        }
                        if (lengthNeeded > 1) {
                            cards += '<tr>' + lengthPlayersLine + '</tr>';
                            cards += '<tr>' + winnerPlayersLine + '</tr>';
                        }
                        cards += '<tr>' + pointsPlayersLine + '</tr>';
                        cards += '</tbody></table>';


                        cards += '</div></div></div>';
                        pastGames.innerHTML = cards;
                        localStorage.setItem('pastgames',cards);
                    }
                }
                callMasonry('grid2','grid-item');
            });
        });
    });
}

function futureGamesBuilder(futureGamesDB, CurrentTime){
  var sortedTimes = sortingObject('timestamp', futureGamesDB);
  var pastGamesArray = [];
  var countPlayers = 0;
  dbScores = firebase.database().ref().child('scores');
  dbResources = firebase.database().ref().child('resources');
  futurecards = '';
  dbResources.once('value').then(function(snapshot) {
      dbWettbewerb = snapshot.child('wettbewerb').val();
      dbMannschaft = snapshot.child('mannschaft').val();
      dbScores.on('value', function(snapshot) {
          dbScores = snapshot.val();
          dbPlayers = firebase.database().ref().child('players');
          dbPlayers.on('value', function(snapshot) {
              dbPlayers = snapshot.val();
              for (var p in dbPlayers) {
                  //Counting number of players
                  countPlayers += 1;
              }

              for (var i = 0; i < sortedTimes.length; i++) {
                  //Looping through all games
                  //Defining all Variabeles
                  var useID = sortedTimes[i].key;
                  var item = futureGamesDB[useID];
                  var countTipps = 0;
                  var namePlayersLine = "<thead><tr>";
                  var tippPlayersLine = "";
                  var lengthPlayersLine = "";
                  var winnerPlayersLine = "";
                  var pointsPlayersLine = "";
                  for (j in dbPlayers) {
                      //Checking if every player has submitted a tipp
                      if (dbPlayers[j][useID]) {
                          countTipps += 1;
                          //create playersline for table
                          namePlayersLine += "<th>" + j + "</th>";
                          tippPlayersLine += '<td>' + dbPlayers[j][useID].scoreM1 + ':' + dbPlayers[j][useID].scoreM1 + '</td>';
                          if (dbPlayers[j][useID].length == "") {
                              lengthPlayersLine += '<td style="font-size:smaller;">Non-Tipp</td>';
                          } else {
                              lengthPlayersLine += '<td>' + dbPlayers[j][useID].length + '</td>';
                          }
                          winnerPlayersLine += '<td style="font-size:smaller;">' + dbPlayers[j][useID].winner + '</td>';
                          n = dbPlayers[j][useID].totalpoints;
                          pointsPlayersLine += '<td  style="border-top: 1px solid #d0d0d0">' + (n <= 0 ? '' : '+') + n + '</td>';
                      }
                  }
                  namePlayersLine += "</thead></tr>";
                  if (countTipps == countPlayers || CurrentTime > item['timestamp']) {
                      //Checks if every player has submitted a tipp and then proceeds to create card
                      futurecards += '<div class="col s12 m6 grid-item"><div class = "card" style = "background-color:#fff" ><div class = "card-content" >';
                      futurecards += '<span class="badge"><img src="' + dbWettbewerb[item['wettbewerb']] + '" alt="' + item['wettbewerb'] + '" class="responsive-img" style="height:30px"/></span>';
                      futurecards += '<p style="font-size:larger; font-weight:bold"><img src="' + dbMannschaft[item['mannschaft1']] + '" alt="Mannschaft1" class="responsive-img" style="height: 14px; margin-right: 7px;" />' + item['mannschaft1'] + '</p>';
                      futurecards += '<p style="font-size:larger; font-weight:bold"><img src="' + dbMannschaft[item['mannschaft2']] + '" alt="Mannschaft1" class="responsive-img" style="height: 14px; margin-right: 7px;" />' + item['mannschaft2'] + '</p>';
                      futurecards += '<p style="font-size:smaller; font-weight:inherit; color:#999">' + item['wettbewerb'] + ' ' + item['fortschritt'] + ' ' + item['art'] + ' am ' + new Date(item['timestamp']).toLocaleDateString() + ' um ' + new Date(item['timestamp']).toLocaleTimeString() + ' Uhr</p>';
                      finalscores = false;
                      if (dbScores[useID]) {
                          //Checks if there already are final scores for the game
                          finalscores = true;
                          futurecards += '<div class="divider" style="margin-bottom: 2px;"></div>';
                          futurecards += '<p class="center" style="font-size:larger; font-weight:bold">' + dbScores[useID].scoreM1 + ':' + dbScores[useID].scoreM2 + '</p>';
                          if (dbScores[useID].length) {
                              if (dbScores[useID].length == "11er") {
                                  displayLength = '(11er)';
                              } else {
                                  displayLength = '(' + dbScores[useID].length + ' mins)';
                              }
                              futurecards += '<p class="center" style="font-size:smaller; font-weight:inherit;">' + dbScores[useID].winner + ' ' + displayLength + '</p>';
                          }
                      }
                      futurecards += '<table class="centered" style="table-layout:fixed">';
                      futurecards += namePlayersLine;
                      futurecards += '<tbody>';
                      futurecards += '<tr>' + tippPlayersLine + '</tr>';
                      //Check if additional information (length, winner) has to be displayed
                      length = item['length'];
                      var lengthNeeded = 0;
                      for (var t in length) {
                          lengthNeeded += 1;
                      }
                      if (lengthNeeded > 1) {
                          futurecards += '<tr>' + lengthPlayersLine + '</tr>';
                          futurecards += '<tr>' + winnerPlayersLine + '</tr>';
                      }
                      if(finalscores){
                      futurecards += '<tr>' + pointsPlayersLine + '</tr>';
                    }
                      futurecards += '</tbody></table>';


                      futurecards += '</div></div></div>';
                      futureGames.innerHTML = futurecards;
                      localStorage.setItem('futuregames',futurecards);
                  }
              }
              callMasonry('grid1');
          });
      });
  });
}


/////Helper Functions
function sortingObject(timestamp, inputObject) {
    // Create an array of keys and timestamps that will be sorted
    var sort_array = [];
    for (var key in inputObject) {
        sort_array.push({
            key: key,
            timestamp: inputObject[key].timestamp
        });
    }
    //The array is sorted
    sort_array.sort(function(x, y) {
        return x.timestamp - y.timestamp
    });
    //The sorted array is returned and the object can then be read out by the sorted arrayd
    return (sort_array);
}

function sortingReverseObject(timestamp, inputObject) {
    // Create an array of keys and timestamps that will be sorted
    var sort_array = [];
    for (var key in inputObject) {
        sort_array.push({
            key: key,
            timestamp: inputObject[key].timestamp
        });
    }
    //The array is sorted
    sort_array.sort(function(x, y) {
        return y.timestamp -  x.timestamp
    });
    //The sorted array is returned and the object can then be read out by the sorted arrayd
    return (sort_array);
}

function displayToast(reason, color) {
    //Display a toast with a certain message
    Materialize.toast('<span id="toast">' + reason + '</span>', 8000, color);
}

function pageBuilder() {
    //Build all elements of the page
    $("#navigation").load('/inc/navigation.html');
    $("#footer").load('/inc/footer.html');
    makeReady();
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyB2ycmW4sCSMm6py_NGdjtE77CGFM2PvGQ",
        authDomain: "project-985851437142041413.firebaseapp.com",
        databaseURL: "https://project-985851437142041413.firebaseio.com",
        storageBucket: "project-985851437142041413.appspot.com",
    };
    firebase.initializeApp(config);
}

function makeReady() {
    //Trigger javascript to activate elements for navigation and dropdowns
    $('select').material_select();
    $(".button-collapse").sideNav();
}

function callMasonry(grid, item, mode) {
    if (grid) {
        grid = '.' + grid;
    } else {
        grid = '.grid';
    }
    if (item) {
        item = '.' + item;
    } else {
        item = '.grid-item';
    }
    if (mode) {} else {
        mode = 'masonry';
    }
    $(grid).isotope({
        // options
        itemSelector: item,
        layoutMode: mode
    });
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
