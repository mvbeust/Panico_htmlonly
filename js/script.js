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
    futurecards = localStorage.getItem('futuregames');
    futuregamesdiv = document.getElementById('futureGames');
    futuregamesdiv.innerHTML = futurecards;
    cards = localStorage.getItem('pastgames');
    pastgamesdiv = document.getElementById('pastGames');
    pastgamesdiv.innerHTML = cards;
    document.getElementById('mainTable').innerHTML = localStorage.getItem('monthTable');
    document.getElementById('monthyTables').innerHTML = localStorage.getItem('monthyTables');
    document.getElementById('panicoDate').innerHTML = moment(localStorage.getItem('panicoDate')).format('LLLL') + ' (' + moment(localStorage.getItem('panicoDate')).fromNow() + ')';
    document.getElementById('monthDate').innerHTML = moment(localStorage.getItem('monthDate')).format('LLLL') + ' (' + moment(localStorage.getItem('monthDate')).fromNow() + ')';
    document.getElementById('tippsDate').innerHTML = moment(localStorage.getItem('tippsDate')).format('LLLL') + ' (' + moment(localStorage.getItem('tippsDate')).fromNow() + ')';

    makeReady();
    callMasonry('grid1', 'grid-item');
    callMasonry('grid2', 'grid-item');
    $('.modal-trigger').leanModal();
    $('.material-icons').hide();
    $('.collapsible').collapsible({
        accordion: false
    });
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
        dbRefFutureGames = dbRefFutureGames.startAt(TimeBreak).limitToFirst(16);
        dbRefFutureGames.on('value', function(snapshot) {
            futureGamesDB = snapshot.val();
            futureGamesBuilder(futureGamesDB, CurrentTime);
        });

        //Select entries for past games
        dbRefPastGames = firebase.database().ref().child('spiele');
        dbRefPastGames = dbRefPastGames.orderByChild('timestamp');
        dbRefPastGames = dbRefPastGames.endAt(TimeBreak).limitToLast(26);
        dbRefPastGames.on('value', function(snapshot) {
            pastGamesDB = snapshot.val();
            pastGamesBuilder(pastGamesDB);
        });

    } else {
        window.location = "/offline.html";
    }
    makeReady();
}

function notificationsPageBuilder() {
    //Build page for notification management
    if (navigator.onLine) {
        pageBuilder();
        if (('showNotification' in ServiceWorkerRegistration.prototype)) {
            console.log('Notifications are supported.');
            notificationIDhandling();
        } else {
            html = '';
            html += '<span class="card-title">Notifications not supported</span>';
            html += 'Notifications werden leider in diesem Browser nicht unterstützt. Auf iOS Geräten gibt es diese Option leider in keinem Browser.<br><br>Auf anderen Geräten sollten Chrome, Firefox oder Browser basierend auf diesen Systemen funktionieren.'
            document.getElementById('id').innerHTML = html;
        }
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
        "length": "multiple",
        "hinspiel": "text",
    };
    var form = "";
    for (var i in formfields) {
        if (i == "length") {
            form += '<div class="input-field col s12"><select multiple id="length"><option value="" disabled selected>Choose Length</option><option value="90">90</option><option value="120">120</option><option value="11er">11er</option></select><label>Length</label></div>'
        } else if (i == "oldtimestamp") {
            form += '<div class="input-field col s12 hide"><input type="' + formfields[i] + '" id="' + i + '" name="' + i + '" /><label for="' + i + '">' + i + '</label></div>';
        } else if (i == "hinspiel") {
            form += '<div class="input-field col s12"><input class="autocomplete" type="' + formfields[i] + '" id="' + i + '" name="' + i + '" required/><label for="' + i + '">' + i + '</label></div>';
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
            if (j == "hinspiel") {
                if (item["art"] == "Hinspiel") {
                    console.log(useID);
                }
            }
        }
        passID = "'" + useID + "'";
        table += '<td><input class="btn" name="edit" type="submit" value="Edit" onclick="editGames(allGames,' + passID + ')" /></td>';
        table += '<td><input class="btn" name="deleteshow' + useID + '" type="submit" value="Delete" id="deleteshow' + useID + '" onclick="showDeleteButton(' + passID + ')" /><input class="btn red" style="display: none;" name="reallydelete' + useID + '" id="reallydelete' + useID + '" type="submit" value="Really?" onclick="deleteGame(' + passID + ')"/></td>';
        table += '</tr>';
        var gameswithHinspiel = [];
        gameswithHinspiel.push({
            ID: useID
        });
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
    if (inputselection == "hinspiel") {} else {
        //Autocomplete list is requested from database
        dbResources = firebase.database().ref('resources/' + inputselection);
        dbResources.on('value', function(snapshot) {
            dbResources = snapshot.val();
            console.log(dbResources);
            //Required javascript code is generated
            $('input#' + outputSelection).autocomplete({
                data: dbResources
            });
        });
    }
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
    document.getElementById('oldtimestamp').value = ID;
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
    datevalue = Date.parse(timestamp);
    //Check if a game is edited or a new game is created
    if (oldtimestamp) {
        console.log("Editing existing game");
        var identification = oldtimestamp;
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

function changeBonusPoints() {

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
    millisecs = 60000;
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
            if (item['timestamp'] > CurrentTime + 14400 * millisecs) {
                continue;
            }
            for (j in dbPlayers) {
                //Checking if every player has submitted a tipp
                if (dbPlayers[j][useID]) {
                    countTipps += 1;
                    namePlayerTipps += j + ", ";
                }
            }
            namePlayerTipps = namePlayerTipps.substring(0, namePlayerTipps.length - 2);
            fortschritt = item['fortschritt'];
            if (fortschritt == "Normal") {
                fortschritt = "";
            } else if (fortschritt.slice(-1) == "e") {
                fortschritt = fortschritt.substring(0, fortschritt.length - 1)
            }


            //card is opened
            cards += '<div class="col s12 m6 grid-item"><div class = "card" style = "background-color:#fff" ><div class = "card-content" >';
            cards += '<span class="badge"><img src="' + dbWettbewerb[item['wettbewerb']] + '" alt="' + item['wettbewerb'] + '" class="responsive-img" style="height:30px"/></span>';
            cards += '<p style="font-size:larger; font-weight:bold"><picture alt="Mannschaft1" class="responsive-img" style="height: 14px; margin-right: 7px;" ><source type="image/webp" srcset="' + dbMannschaft[item['mannschaft1']] + '.webp"><img src="' + dbMannschaft[item['mannschaft1']] + '.png" height= "14px" /></picture>' + item['mannschaft1'] + '</p>';
            cards += '<p style="font-size:larger; font-weight:bold"><picture alt="Mannschaft2" class="responsive-img" style="height: 14px; margin-right: 7px;" ><source type="image/webp" srcset="' + dbMannschaft[item['mannschaft2']] + '.webp"><img src="' + dbMannschaft[item['mannschaft2']] + '.png" height= "14px" /></picture>' + item['mannschaft2'] + '</p>';
            cards += '<p style="font-size:smaller; font-weight:inherit; color:#999">' + item['wettbewerb'] + ' ' + fortschritt + ' ' + item['art'] + '<a class="tooltipped" style="color:#999" data-position="bottom" data-delay="50" data-tooltip="' + moment(new Date(item['timestamp'])).format('LLLL') + ' Uhr"> ' + moment(new Date(item['timestamp'])).fromNow() + '</a></p>';
            cards += '<p style="font-size:smaller; font-weight:inherit; color:#999" id="' + useID + 'notesfield"></p>';
            if (countTipps != countPlayers) {
                m1 = item['mannschaft1'];
                m2 = item['mannschaft2'];
                art = item['art'];
                transuseID = "'" + useID + "'";
                transm1 = "'" + m1 + "'";
                transm2 = "'" + m2 + "'";
                transart = "'" + art + "'";
                cards += '<div class="input-field col s6 m6"><input id="' + useID + 'M1" type="number" class="validate" onchange="changeWinnerSelect(' + transuseID + ',' + transm1 + ',' + transm2 + ',' + transart + ')"><label for="' + useID + 'M1">Heim</label></div>';
                cards += '<div class="input-field col s6 m6"><input id="' + useID + 'M2" type="number" class="validate" onchange="changeWinnerSelect(' + transuseID + ',' + transm1 + ',' + transm2 + ',' + transart + ')"><label for="' + useID + 'M2">Gast</label></div>';
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
        if (printedCards < 1) {
            cards = '<div class="row">';
            cards += '<div class="col s12 m6 grid-item"><div class = "card" style = "background-color:#fff" ><div class = "card-content" >Keine Spiele  zu tippen </div></div></div>';
            cards += '</div>';
            document.getElementById('submitbutton').className += ' disabled';
        }
        formTippen.innerHTML = cards;
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
            abgabeZeit = Math.floor(Date.now());
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

function changeWinnerSelect(useID, m1, m2, art) {
    var winnerSelect = document.getElementById(useID + "Winner");
    console.log(m1);
    if (winnerSelect && art == "Rückspiel") {
        firebase.database().ref('spiele/' + useID).once('value').then(function(snapshot) {
            var hinspielID = snapshot.val().hinspiel;
            console.log(hinspielID);
            firebase.database().ref('scores/' + hinspielID).once('value').then(function(snapshot) {
                var hinspielScoreM2 = snapshot.val().scoreM1;
                var hinspielScoreM1 = snapshot.val().scoreM2;
                console.log("Hinspiel: " + m2 + " " + hinspielScoreM2 + ":" + hinspielScoreM1 + " " + m1);
                document.getElementById(useID + 'notesfield').innerHTML = "Hinspiel: " + m2 + " " + hinspielScoreM2 + ":" + hinspielScoreM1 + " " + m1;

                //Check if a Winner actually has to be selected
                scoreMannschaft1 = document.getElementById(useID + 'M1').value;
                scoreMannschaft2 = document.getElementById(useID + 'M2').value;
                if (scoreMannschaft1 && scoreMannschaft2) {
                    //Check if there are scores are entred for both teams before comparison is  started
                    if (scoreMannschaft1 > scoreMannschaft2) {
                        winnerSelect.value = m1;
                    } else if (scoreMannschaft1 < scoreMannschaft2) {
                        winnerSelect.value = m2;
                    } else if (scoreMannschaft1 == scoreMannschaft2) {
                        //Wenn das Rückspiel ein Unentschieden war
                        if (hinspielScoreM1 > hinspielScoreM2) {
                            winnerSelect.value = m1;
                        } else if (hinspielScoreM1 < hinspielScoreM2) {
                            winnerSelect.value = m2;
                        } else if (hinspielScoreM1 == hinspielScoreM2) {
                            //Wenn das Hinspiel auch ein Unentschieden war
                            if (scoreMannschaft2 > hinspielScoreM1) {
                                winnerSelect.value = m2;
                            } else if (scoreMannschaft2 < hinspielScoreM1) {
                                winnerSelect.value = m1;
                            }
                        }
                    }
                    if ((scoreMannschaft1 == hinspielScoreM1) && (scoreMannschaft2 == hinspielScoreM2)) {
                        document.getElementById(useID + 'Length').value = "11er";
                    } else if (document.getElementById(useID + 'Length').value == "11er") {
                        document.getElementById(useID + 'Length').value = "90";
                    }
                    $('#' + useID + 'Length').material_select();
                    $('#' + useID + 'Winner').material_select();
                }

            });
        });
    } else if (winnerSelect) {
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
            if (scoreMannschaft1 == scoreMannschaft2) {
                document.getElementById(useID + 'Length').value = "11er";
            } else if (document.getElementById(useID + 'Length').value == "11er") {
                document.getElementById(useID + 'Length').value = "90";
            } else if ((scoreMannschaft1 > 0 || scoreMannschaft2 > 0) && (document.getElementById(useID + 'Length').value == "")) {
                console.log(document.getElementById(useID + 'Length').value);
                document.getElementById(useID + 'Length').value = "90";
            }
            $('#' + useID + 'Length').material_select();
            $('#' + useID + 'Winner').material_select();
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
    var entries = {};
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
                        totalpoints += Number(bonuspunkte);
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
                    var totalpoints = -1;
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
                    console.log(playerWinner);
                    console.log(winner);
                    if (playerWinner == winner) {
                        console.log(bonuspunkte);
                        totalpoints += Number(bonuspunkte);
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
    //Calc Table for current Month
    month = 1;
    onedayArray(allPlayersScores, 24);
    monthTable(allPlayersScores, month);
    if (new Date() > new Date("2016-09-01")) {
        //Calc Table for last month
        month = 0;
        monthTable(allPlayersScores, month);
    }
}

function monthTable(allPlayersScores, month) {
    //This function requests all games that are in a specified month
    //Labels for months are created
    monthLabels = [0, "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    if (new Date() > new Date("2017-08-15")) {
        //This is a check that checks if the Season has ended
        return;
    }
    //get all games that are in the specified month
    currentMonth = new Date().getMonth() + month;

    if (currentMonth < 10) {
        currentMonth = "0" + currentMonth;
    }
    currentMonth = new Date("2016-" + currentMonth + "-01T00:00:00+02:00");
    //get first and late point in time of specified month
    currentMonth = monthStartEnd(currentMonth);
    console.log(currentMonth[1]);

    //Request all games in the specified month
    dbRefCurrentMonthGames = firebase.database().ref().child('spiele');
    dbRefCurrentMonthGames = dbRefCurrentMonthGames.orderByChild('timestamp');
    dbRefCurrentMonthGames = dbRefCurrentMonthGames.startAt(currentMonth[0]).endAt(currentMonth[1]);

    dbRefCurrentMonthGames.on('value', function(snapshot) {
        CurrentMonthGames = snapshot.val();
        //label the specified month
        label = monthLabels[new Date().getMonth() + month];
        calcMonthPoints(CurrentMonthGames, allPlayersScores, label);
    });

    dbPanicoTable = firebase.database().ref('table').child('panico');
    dbPanicoTable.on('value', function(snapshot) {
        dbPanicoTable = snapshot.val();
        panicoHTML(allPlayersScores, dbPanicoTable);
    });
}

function calcMonthPoints(CurrentMonthGames, allPlayersScores, label) {
    //This function calculates the points of every player in every month and submits them to the database
    var table = {};
    for (var p in allPlayersScores) {
        //Looping over all Players
        var singlePlayerScores = allPlayersScores[p];
        var singlePlayerPoints = 0;
        for (var s in CurrentMonthGames) {
            //Looping over all games for every player
            if (singlePlayerScores[s]) {
                if (singlePlayerScores[s]['totalpoints'] > 0 || singlePlayerScores[s]['totalpoints'] < 0) {
                    //Check if game was already played & the player has received points and then sum up all points
                    singlePlayerPoints += singlePlayerScores[s]['totalpoints'];
                }
            }
        }
        //Push player and points to object (points are named timestamp just to used the same ordering function and are negative to reverse sorting)
        table[p] = -singlePlayerPoints;
    }
    //Update specified montly table in database
    dbRefTable = firebase.database().ref('table/month/' + label);
    dbRefTable.update(table);
    createSubtables();
}

function createSubtables() {
    //This function displays the monthly tables of all months in the database and calls a panico calculation
    sortedMonths = ["Juli", "Juni", "Mai", "April", "März", "Februar", "Januar", "Dezember", "November", "Oktober", "September", "August"];
    panicoPunkte = {
        "Juli": 12,
        "Juni": 11,
        "Mai": 10,
        "April": 9,
        "März": 8,
        "Februar": 7,
        "Januar": 6,
        "Dezember": 5,
        "November": 4,
        "Oktober": 3,
        "September": 2,
        "August": 1
    };
    dbRefTable = firebase.database().ref('table/month');
    dbRefTable.on('value', function(snapshot) {
        subtables = snapshot.val();
        monthlytableHTML = '';
        monthNumber = 0;
        var entry = {};
        monthlytableHTML += ' <ul class="collapsible" data-collapsible="expandable" style="background-color:#eeeeee">';
        for (i in sortedMonths) {
            //A loop is created over all months (in the right order for the game)
            singleSubtable = subtables[sortedMonths[i]]; //Every month is isolated
            if (subtables[sortedMonths[i]]) {
                monthNumber += 1; //Is a month is in the database a new month is counted
                var monthtable = [];
                for (p in singleSubtable) {
                    //The Data for every player is entered into an array
                    monthtable.push({
                        name: p,
                        timestamp: singleSubtable[p],
                        onedaypoints: subtables['oneday'][p]
                    })

                }

                //Sorting table
                var sortedTable = sortingObject('timestamp', monthtable);
                if (monthNumber == 1) {
                    //Special HTML formatting for curent month
                    monthlytableHTML += '<li><div class="collapsible-header active" style="font-weight: bold"><i class="material-icons">today</i>' + sortedMonths[i] + ' (+' + panicoPunkte[sortedMonths[i]] + ')</div> <div class="collapsible-body" style="padding: 20px; margin: 0px; display: block; background-color:#f5f5f5"> <table class="bordered highlight"> <tbody>';
                    monthlytableHTML += '<tr><th>Platz</th><th>Name</th><th>Punke</th><th>24hrs</th></tr>';
                } else {
                    monthlytableHTML += '<li><div class="collapsible-header" style="font-weight: bold"><i class="material-icons">history</i>' + sortedMonths[i] + ' (+' + panicoPunkte[sortedMonths[i]] + ')</div> <div class="collapsible-body" style="padding: 20px; margin: 0px; display: block; background-color:#f5f5f5"> <table class="bordered highlight"> <tbody>';
                    monthlytableHTML += '<tr><th>Platz</th><th>Name</th><th>Punke</th></tr>';
                }
                var platz = 0;
                var previousPlayerPoints = 0;
                for (var j = 0; j < sortedTable.length; j++) {
                    var useID = sortedTable[j].key;
                    var item = monthtable[useID];
                    var myPoints = item['timestamp'];
                    if (previousPlayerPoints != myPoints) {
                        //Check if Player has more points than previous Player (unequal is enough as the array has been sorted anyways)
                        //If player has less points, he will be ranked down
                        platz += 1;
                    }
                    if (monthNumber == 2) {
                        //if the past month is looped, Panico are calculated
                        entry[item['name']] = panicoCalc(platz, panicoPunkte[sortedMonths[i]]);
                        panicoMonth = sortedMonths[i]; //The month of the panico calculations is saved for later
                    }
                    //Building lines of the table
                    if (localStorage.getItem('username') == item['name']) {
                        //highlight the values of the current user
                        monthlytableHTML += '<tr style="color: #3f51b5; font-weight: bold">';
                    } else {
                        monthlytableHTML += '<tr>';
                    }
                    monthlytableHTML += '<td>' + platz + '.</td>';
                    monthlytableHTML += '<td>' + item['name'] + '</td>';
                    monthlytableHTML += '<td>' + -myPoints + '</td>';
                    if (monthNumber == 1) {
                        n = item['onedaypoints'];
                        monthlytableHTML += '<td>' + (n <= 0 ? '' : '+') + n + '</td>';
                    }
                    monthlytableHTML += '</tr>';
                    previousPlayerPoints = myPoints;
                }
                monthlytableHTML += '</tbody> </table> </div> </li>';
            }
        }
        if (monthNumber == 2) {
            monthly2tableHTML = monthlytableHTML;
            monthly2tableHTML += '</ul>';
            localStorage.setItem('monthyTables', monthly2tableHTML);
            localStorage.setItem('monthDate', new Date());
        }
        monthlytableHTML += '</ul>';
        //Panico are submitted to the database
        dbRefPanico = firebase.database().ref('table/panico/' + panicoMonth);
        dbRefPanico.update(entry);

        document.getElementById('monthyTables').innerHTML = monthlytableHTML;

        $('.collapsible').collapsible({
            accordion: false
        });
    });
}

function panicoCalc(platz, multiplier) {
    if (platz == 1) {
        panicoPoints = multiplier;
    } else if (platz == 2) {
        panicoPoints = multiplier * 0.5;
    } else {
        panicoPoints = 0;
    }
    return panicoPoints;
}

function panicoHTML(allPlayersScores, dbPanicoTable) {
    tableHTML = '<table class="striped">';
    tableHTML += '<thead><tr><th data-field="platz">Platz</th><th data-field="name">Name</th><th data-field="points">Panico</th><th data-field="points">Punkte</th></tr></thead>';
    tableHTML += '<tbody>';
    var table = [];
    for (var p in allPlayersScores) {
        //Looping over all Players
        var totalPanico = 0;
        for (var m in dbPanicoTable) {
            //Panico are calculated
            totalPanico += dbPanicoTable[m][p];
        }
        //Normal Points are calculated
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
            timestamp: -totalPanico,
            normalpoints: singlePlayerPoints
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
        var normalPoints = item['normalpoints'];
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
        tableHTML += '<td>' + normalPoints + '</td>';
        tableHTML += '</tr>';
        previousPlayerPoints = myPoints;
    }
    tableHTML += '</tbody></table>';
    mainTable.innerHTML = tableHTML;
    localStorage.setItem('monthTable', tableHTML);
    localStorage.setItem('panicoDate', new Date());
    makeReady();
}

function onedayArray(allPlayersScores, gobackhours) {
    //Calculates the points from a specific point in time to the current time (usually 24 hours)
    CurrentTime = Math.floor(Date.now());
    millisecs = 60000;

    //Create Timebreak between past and future
    TimeBreak = CurrentTime - (gobackhours * 60 * millisecs);

    //Select entries for furute and current games
    dbRefOnedayGames = firebase.database().ref().child('spiele');
    dbRefOnedayGames = dbRefOnedayGames.orderByChild('timestamp');
    dbRefOnedayGames = dbRefOnedayGames.startAt(TimeBreak).endAt(CurrentTime);
    dbRefOnedayGames.on('value', function(snapshot) {
        onedayGames = snapshot.val();
        var oneday = {};
        for (var p in allPlayersScores) {
            //Looping over all Players
            var singlePlayerScores = allPlayersScores[p];
            var singlePlayerPoints = 0;
            var onedayscore = 0;
            for (var s in onedayGames) {
                //Looping over all games for every player
                if (singlePlayerScores[s]) {
                    if (singlePlayerScores[s]['totalpoints'] > 0 || singlePlayerScores[s]['totalpoints'] < 0) {
                        if (onedayGames[s].timestamp > TimeBreak) {
                            onedayscore += singlePlayerScores[s]['totalpoints'];
                        }
                    }
                }
            }
            oneday[p] = onedayscore;
        }
        dbRefOnedayTable = firebase.database().ref('table/month/oneday');
        dbRefOnedayTable.update(oneday);
    });
}

function monthStartEnd(date) {
    var date = new Date(date);
    var firstDay = Math.floor(new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1)));
    var lastDay = Math.floor(new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)));
    return [firstDay, lastDay];
}


//////Build Tipps Anzeigen Functions
function pastGamesBuilder(pastGamesDB) {
    var sortedTimes = sortingReverseObject('timestamp', pastGamesDB);
    dbScores = firebase.database().ref().child('scores');
    dbResources = firebase.database().ref().child('resources');
    dbResources.once('value').then(function(snapshot) {
        dbWettbewerb = snapshot.child('wettbewerb').val();
        dbMannschaft = snapshot.child('mannschaft').val();
        dbScores.on('value', function(snapshot) {
            dbScores = snapshot.val();
            dbPlayers = firebase.database().ref().child('players');
            dbPlayers.on('value', function(snapshot) {
                dbPlayers = snapshot.val();
                cards = '';
                var pastGamesArray = [];
                var countPlayers = 0;
                var printedCards = 0;
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
                    var nonTippAdded = false;
                    for (j in dbPlayers) {
                        //Checking if every player has submitted a tipp
                        if (localStorage.getItem('username') == j) {
                            addstyle = 'color: #3f51b5; font-weight: bold;';
                        } else {
                            addstyle = '';
                        }
                        if (dbPlayers[j][useID]) {
                            countTipps += 1;
                            //create playersline for table
                            namePlayersLine += "<th style='" + addstyle + "'>" + j + "</th>";
                            tippPlayersLine += '<td style="' + addstyle + '">' + dbPlayers[j][useID].scoreM1 + ':' + dbPlayers[j][useID].scoreM2 + '</td>';
                            if (dbPlayers[j][useID].length == "") {
                                lengthPlayersLine += '<td style="' + addstyle + 'font-size:smaller;">Non-Tipp</td>';
                                nonTippAdded = true;
                            } else {
                                lengthPlayersLine += '<td style="' + addstyle + '">' + dbPlayers[j][useID].length + '</td>';
                            }
                            winnerPlayersLine += '<td style="' + addstyle + 'font-size:smaller;">' + dbPlayers[j][useID].winner + '</td>';
                            n = dbPlayers[j][useID].totalpoints;

                            if (nonTippAdded == false && dbPlayers[j][useID].nontipp) {
                                nontippInfo = " (NT)";
                            } else {
                                nontippInfo = "";
                            }
                            pointsPlayersLine += '<td style="' + addstyle + 'border-top: 1px solid #d0d0d0">' + (n <= 0 ? '' : '+') + n + nontippInfo + '</td>';
                        }
                    }
                    namePlayersLine += "</thead></tr>";
                    if (countTipps == countPlayers || CurrentTime > item['timestamp']) {
                        //Checks if every player has submitted a tipp and then proceeds to create card
                        cards += '<div class="col s12 m6 grid-item"><div class = "card" style = "background-color:#fff" ><div class = "card-content" >';
                        cards += '<span class="badge"><img src="' + dbWettbewerb[item['wettbewerb']] + '" alt="' + item['wettbewerb'] + '" class="responsive-img" style="height:30px"/></span>';
                        cards += '<p style="font-size:larger; font-weight:bold"><picture alt="Mannschaft1" class="responsive-img" style="height: 14px; margin-right: 7px;" ><source type="image/webp" srcset="' + dbMannschaft[item['mannschaft1']] + '.webp"><img src="' + dbMannschaft[item['mannschaft1']] + '.png" height= "14px" /></picture>' + item['mannschaft1'] + '</p>';
                        cards += '<p style="font-size:larger; font-weight:bold"><picture alt="Mannschaft2" class="responsive-img" style="height: 14px; margin-right: 7px;" ><source type="image/webp" srcset="' + dbMannschaft[item['mannschaft2']] + '.webp"><img src="' + dbMannschaft[item['mannschaft2']] + '.png" height= "14px" /></picture>' + item['mannschaft2'] + '</p>';
                        cards += '<p style="font-size:smaller; font-weight:inherit; color:#999">' + item['wettbewerb'] + ' ' + item['fortschritt'] + ' ' + item['art'] + ' am ' + moment(new Date(item['timestamp'])).format('LLLL') + ' Uhr</p>';
                        finalscores = false;
                        if (dbScores[useID]) {
                            finalscores = true;
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
                        if (finalscores) {
                            cards += '<tr>' + pointsPlayersLine + '</tr>';
                        }
                        cards += '</tbody></table>';

                        printedCards += 1;
                        cards += '</div></div></div>';
                        pastGames.innerHTML = cards;
                        localStorage.setItem('pastgames', cards);
                        localStorage.setItem('tippsDate', new Date());
                    }
                }
                callMasonry('grid2', 'grid-item');
                if (printedCards < 1) {
                    cards = '<div class="col s12 m6 grid-item"><div class = "card" style = "background-color:#fff" ><div class = "card-content" >Keine alten Tipps anzuzeigen</div></div></div>';
                    pastGames.innerHTML = cards;
                }
            });
        });
    });
}

function futureGamesBuilder(futureGamesDB, CurrentTime) {
    var sortedTimes = sortingObject('timestamp', futureGamesDB);
    dbScores = firebase.database().ref().child('scores');
    dbResources = firebase.database().ref().child('resources');
    dbResources.once('value').then(function(snapshot) {
        dbWettbewerb = snapshot.child('wettbewerb').val();
        dbMannschaft = snapshot.child('mannschaft').val();
        dbScores.on('value', function(snapshot) {
            dbScores = snapshot.val();
            dbPlayers = firebase.database().ref().child('players');
            dbPlayers.on('value', function(snapshot) {
                futurecards = '';
                var pastGamesArray = [];
                var countPlayers = 0;
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
                    var nonTippAdded = false;
                    for (j in dbPlayers) {
                        //Checking if every player has submitted a tipp
                        if (localStorage.getItem('username') == j) {
                            addstyle = 'color: #3f51b5; font-weight: bold;';
                        } else {
                            addstyle = '';
                        }
                        if (dbPlayers[j][useID]) {
                            countTipps += 1;
                            //create playersline for table
                            namePlayersLine += "<th style='" + addstyle + "'>" + j + "</th>";
                            tippPlayersLine += '<td style="' + addstyle + '">' + dbPlayers[j][useID].scoreM1 + ':' + dbPlayers[j][useID].scoreM2 + '</td>';
                            if (dbPlayers[j][useID].length == "") {
                                lengthPlayersLine += '<td style="' + addstyle + 'font-size:smaller;">Non-Tipp</td>';
                                nonTippAdded = true;
                            } else {
                                lengthPlayersLine += '<td style="' + addstyle + '">' + dbPlayers[j][useID].length + '</td>';
                            }
                            winnerPlayersLine += '<td style="' + addstyle + 'font-size:smaller;">' + dbPlayers[j][useID].winner + '</td>';
                            n = dbPlayers[j][useID].totalpoints;

                            if (nonTippAdded == false && dbPlayers[j][useID].nontipp) {
                                nontippInfo = " (NT)";
                            } else {
                                nontippInfo = "";
                            }
                            pointsPlayersLine += '<td style="' + addstyle + 'border-top: 1px solid #d0d0d0">' + (n <= 0 ? '' : '+') + n + nontippInfo + '</td>';
                        }
                    }
                    namePlayersLine += "</thead></tr>";
                    if (countTipps == countPlayers || CurrentTime > item['timestamp']) {
                        //Checks if every player has submitted a tipp and then proceeds to create card
                        futurecards += '<div class="col s12 m6 grid-item"><div class = "card" style = "background-color:#fff" ><div class = "card-content" >';
                        futurecards += '<span class="badge"><img src="' + dbWettbewerb[item['wettbewerb']] + '" alt="' + item['wettbewerb'] + '" class="responsive-img" style="height:30px"/></span>';
                        futurecards += '<p style="font-size:larger; font-weight:bold"><picture alt="Mannschaft1" class="responsive-img" style="height: 14px; margin-right: 7px;" ><source type="image/webp" srcset="' + dbMannschaft[item['mannschaft1']] + '.webp"><img src="' + dbMannschaft[item['mannschaft1']] + '.png" height= "14px" /></picture>' + item['mannschaft1'] + '</p>';
                        futurecards += '<p style="font-size:larger; font-weight:bold"><picture alt="Mannschaft2" class="responsive-img" style="height: 14px; margin-right: 7px;" ><source type="image/webp" srcset="' + dbMannschaft[item['mannschaft2']] + '.webp"><img src="' + dbMannschaft[item['mannschaft2']] + '.png" height= "14px" /></picture>' + item['mannschaft2'] + '</p>';
                        futurecards += '<p style="font-size:smaller; font-weight:inherit; color:#999">' + item['wettbewerb'] + ' ' + item['fortschritt'] + ' ' + item['art'] + '<a class="tooltipped" style="color:#999" data-position="bottom" data-delay="50" data-tooltip="' + moment(new Date(item['timestamp'])).format('LLLL') + ' Uhr"> ' + moment(new Date(item['timestamp'])).fromNow() + '</a></p>';
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
                        if (finalscores) {
                            futurecards += '<tr>' + pointsPlayersLine + '</tr>';
                        }
                        futurecards += '</tbody></table>';


                        futurecards += '</div></div></div>';
                        futureGames.innerHTML = futurecards;
                        localStorage.setItem('futuregames', futurecards);
                        localStorage.setItem('tippsDate', new Date());
                    }
                }
                callMasonry('grid1');
            });
        });
    });
}


/////Notifications
function notifications() {
    //What happens when a notification is being received when the site is open
    //otherwise this will be handled by the serviceworker
    messaging.onMessage(function(payload) {
        console.log(payload);
    });
    messaging.onTokenRefresh(function() {
        messaging.getToken()
            .then(function(refreshedToken) {
                var username = localStorage.getItem('username');
                var devicename = localStorage.getItem('devicename');
                console.log('Token refreshed.');
                // Indicate that the new Instance ID token has not yet been sent to the
                // Send Instance ID token to app server.
                notificationTokenServer(refreshedToken, username, devicename);
            })
    });

}

function notificationSetup() {
    //Request permission to the notification service
    console.log('Requesting permission...');
    //Request Values from Form
    player = document.getElementById("player").value;
    devicename = document.getElementById("devicename").value;
    console.log(player);
    console.log(devicename);
    if (player == "" || devicename == "") {
        console.log("Values not provided");
    } else {
        //Save Values to Local Storage
        localStorage.setItem('username', player);
        localStorage.setItem('devicename', devicename);
        messaging.requestPermission()
            .then(function() {
                //if permission to send notifications has been granted
                console.log('Notification permission granted.');
                return messaging.getToken();
            })
            .then(function(token) {
                //dealing with the token of the notification service
                notificationTokenServer(token, player, devicename);
                notificationsSetting();
            })
    }
}

function notificationSignup() {
    //A signup process is shown if the device is not receiving notifications
    dbWettbewerb = firebase.database().ref();
    dbWettbewerb.on('value', function(snapshot) {
        dbPlayers = snapshot.child('players').val();
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
        }
        cards += '</select></p>';
        cards += '<div class="input-field col s12"><input type="text" id="devicename" name="devicename" /><label for="devicename">Name des Geräts</label></div>';
        cards += '<input class="btn" name="Notifications erhalten" type="submit" value="Notifications erhalten" onclick="notificationSetup()" />';
        cards += '</div></div></div></div>';
        document.getElementById("signupform").innerHTML = cards;
        makeReady();
    });
}

function notificationsSetting() {
    //Settings are shown if the device is already registered
    var player = localStorage.getItem('username');
    dbRefNotifications = firebase.database().ref('notifications/' + player);
    dbRefNotifications.on('value', function(snapshot) {
        notificationDevices = snapshot.val();
        html = '';
        html += '<span class="card-title">Settings</span>';
        html += '<table><tbody>';
        for (var j in notificationDevices) {
            html += "<tr>";
            html += "<td>" + j + "</td>";
            passID = "'" + j + "'";
            html += '<td><input class="btn" name="deleteshow' + j + '" type="submit" value="Delete" id="deleteshow' + j + '" onclick="showDeleteButton(' + passID + ')" /><input class="btn red" style="display: none;" name="reallydelete' + j + '" id="reallydelete' + j + '" type="submit" value="Really?" onclick="deleteDevice(' + passID + ')"/></td>';
            html += "</tr>"
        }
        html += "</tbody></table>"
        document.getElementById('id').innerHTML = html;
    });

}

function deleteDevice(devicename) {
    //when user wants to manually remove device
    console.log(devicename);
    var username = localStorage.getItem('username');
    dbRefRemoveLine = firebase.database().ref('notifications/' + username + '/' + devicename);
    dbRefRemoveLine.remove();
}

function notificationIDhandling() {
    // Get Instance ID token. Initially this makes a network call, once retrieved
    // subsequent calls to getToken will return from cache.
    messaging.getToken()
        .then(function(currentToken) {
            var username = localStorage.getItem('username');
            var devicename = localStorage.getItem('devicename');
            if (currentToken && username && devicename) {
                notificationTokenServer(currentToken, username, devicename);
                notificationsSetting();
            } else {
                // Show permission request.
                console.log('No Instance ID token available. Request permission to generate one.');
                // Show permission UI.
                notificationSignup();
            }
        })
        //if a new notification token is given to the device this is updated on the server
    messaging.onTokenRefresh(function() {
        messaging.getToken()
            .then(function(refreshedToken) {
                var username = localStorage.getItem('username');
                var devicename = localStorage.getItem('devicename');
                console.log('Token refreshed.');
                // Indicate that the new Instance ID token has not yet been sent to the
                // Send Instance ID token to app server.
                notificationTokenServer(refreshedToken, username, devicename);
            })
    });
}

function notificationTokenServer(token, player, devicename) {
    console.log(token);
    dbRefNotifications = firebase.database().ref('notifications/' + player);
    newTokenEntry = '{"' + devicename + '":"' + token + '"}';
    var deviceUpdate = jQuery.parseJSON(newTokenEntry);
    console.log(deviceUpdate);
    dbRefNotifications.update(deviceUpdate);
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
        return y.timestamp - x.timestamp
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
        messagingSenderId: "76547521231"
    };
    firebase.initializeApp(config);
    messaging = firebase.messaging();
    notifications();
    if (navigator.serviceWorker) {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('ServiceWorker registration successful with scope:', registration.scope);
        });
    }
}

function makeReady() {
    //Trigger javascript to activate elements for navigation and dropdowns
    $('select').material_select();
}

function sideNavAcitvation() {
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
    $('.tooltipped').tooltip({
        delay: 50
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


//////Google Sheets support

function getResources() {
    var config = {
        apiKey: "AIzaSyB2ycmW4sCSMm6py_NGdjtE77CGFM2PvGQ",
        authDomain: "project-985851437142041413.firebaseapp.com",
        databaseURL: "https://project-985851437142041413.firebaseio.com",
        storageBucket: "project-985851437142041413.appspot.com",
    };
    firebase.initializeApp(config);

    dbResourcesRef = firebase.database().ref('resources/mannschaft');
    dbResourcesRef.once('value').then(function(snapshot) {
        dbResources = snapshot.val();
        html = "";
        newurldata = {};
        for (var j in dbResources) {
            html += '/img/clubs/' + dbResources[j].slice(46).slice(0, -4) + '<br>';
            newurldata[j] = '/img/clubs/' + dbResources[j].slice(46).slice(0, -4);
            //newurldata += '"' +  j + '":"' + newurl + '",';
        }
        //newurldata += '}';
        //var newurldata = jQuery.parseJSON(newurldata);
        console.log(newurldata);
        //dbResourcesRef.update(newurldata);
        document.getElementById('ausgabe').innerHTML = html;
    });
}

function importJSON() {
    var config = {
        apiKey: "AIzaSyB2ycmW4sCSMm6py_NGdjtE77CGFM2PvGQ",
        authDomain: "project-985851437142041413.firebaseapp.com",
        databaseURL: "https://project-985851437142041413.firebaseio.com",
        storageBucket: "project-985851437142041413.appspot.com",
    };
    firebase.initializeApp(config);
    dbRefSpiele = firebase.database().ref().child('spiele');
    entries = {};
    console.log(entries);
    dbRefSpiele.update(entries);
}

function timezonefix() {
    var config = {
        apiKey: "AIzaSyB2ycmW4sCSMm6py_NGdjtE77CGFM2PvGQ",
        authDomain: "project-985851437142041413.firebaseapp.com",
        databaseURL: "https://project-985851437142041413.firebaseio.com",
        storageBucket: "project-985851437142041413.appspot.com",
    };
    firebase.initializeApp(config);

    CurrentTime = Math.floor(Date.now());
    millisecs = 60000;
    //Create Timebreak between past and future
    TimeBreak = CurrentTime - (160 * millisecs);
    var ausgabe = "";

    dbRefWintertime = firebase.database().ref().child('spiele');
    dbRefWintertime = dbRefWintertime.orderByChild('timestamp');
    dbRefWintertime = dbRefWintertime.endAt(1490493600000);
    dbRefWintertime.on('value', function(snapshot) {
        winterGames = snapshot.val();
        var options = {};
        options.timeZone = 'Europe/Amsterdam';
        options.timeZoneName = 'short';
        for (var i in winterGames) {
            oldtime = winterGames[i]['timestamp'];
            newtime = oldtime + (60 * millisecs);
            ausgabe += new Date(oldtime).toLocaleString('de-DE', options) + " | " + new Date(newtime).toLocaleString() + "<br>";
        }

        document.getElementById('ausgabe').innerHTML = ausgabe;

    });

}

//////Stay Standalone
if (("standalone" in window.navigator) && window.navigator.standalone) {
    var noddy, remotes = false;
    document.addEventListener("click", function(a) {
        noddy = a.target;
        while (noddy.nodeName !== "A" && noddy.nodeName !== "HTML") {
            noddy = noddy.parentNode
        }
        if ("href" in noddy && noddy.href.indexOf("http") !== -1 && (noddy.href.indexOf(document.location.host) !== -1 || remotes)) {
            a.preventDefault();
            document.location.href = noddy.href
        }
    }, false)
};
