(function() {

}());

function TippenPageBuilder() {
    //Build page for Main Tippen Site
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
        console.log(CurrentTime);
        console.log(CurrentGames);
        createformTippen(CurrentGames, CurrentTime)
    });
    makeReady();
}

function AddGamesPageBuilder() {
    //Build page for adding new games
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
    makeReady();
}

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
    //document.getElementById('length').value = ["90"];
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

function createformTippen(CurrentGames, CurrentTime) {
    //Create the form for submitting new tipps
    formTippenfields = {
        "mannschaft1": "number",
        "mannschaft2": "number",
        "length": "select",
        "winner": "select"
    }
    var table = "";
    cards = "";
    //Request a sorted array of keys (sorted by game kickoff time)
    var sortedTimes = sortingObject('timestamp', CurrentGames);
    for (var i = 0; i < sortedTimes.length; i++) {
      var useID = sortedTimes[i].key;
      var item = CurrentGames[useID];
        //card is opened
        cards += '<div class="col s12 m6 niemals"><div class = "card" style = "background-color:#fff" ><div class = "card-content" >';
        dbWettbewerb = firebase.database().ref();
        dbWettbewerb.once('value').then(function(snapshot) {
            dbWettbewerb = snapshot.child('resources/wettbewerb').val();
            ausgabe = '<span class="badge"><img src="'+ dbWettbewerb[item['wettbewerb']]+'" alt="'+item['wettbewerb']+'" class="responsive-img" style="height:30px"/></span>';
            console.log(dbWettbewerb);
        });
        for (var j in formTippenfields) {
            if (j == "length") {
                lengthforTable = item[j];
                var lengthforTablePrint = '';
                for (var t in lengthforTable) {
                    lengthforTablePrint += lengthforTable[t] + '|';
                }
                lengthforTablePrint = lengthforTablePrint.substring(0, lengthforTablePrint.length - 1);
            } else if (j == "timestamp") {
                table += '<td>' + new Date(item[j]).toLocaleString() + '</td>';
            } else if (j == "oldtimestamp") {} else {
                table += '<td>' + item[j] + '</td>';
            }
        }
        passID = "'" + useID + "'";
    }
    console.log(cards);
    formTippen.innerHTML = cards;
    makeReady();

}


function pageBuilder() {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyB2ycmW4sCSMm6py_NGdjtE77CGFM2PvGQ",
        authDomain: "project-985851437142041413.firebaseapp.com",
        databaseURL: "https://project-985851437142041413.firebaseio.com",
        storageBucket: "project-985851437142041413.appspot.com",
    };
    firebase.initializeApp(config);
    //Build all elements of the page
    $("#navigation").load('/inc/navigation.html');
    $("#footer").load('/inc/footer.html');
    makeReady();
}

function makeReady() {
    //Trigger javascript to activate elements for navigation and dropdowns
    $('select').material_select();
    $(".button-collapse").sideNav();
}
