(function() {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyB2ycmW4sCSMm6py_NGdjtE77CGFM2PvGQ",
        authDomain: "project-985851437142041413.firebaseapp.com",
        databaseURL: "https://project-985851437142041413.firebaseio.com",
        storageBucket: "project-985851437142041413.appspot.com",
    };
    firebase.initializeApp(config);


    //Get Elements
    tableGamesinDB = document.getElementById('GamesinDB');
    const pDatevalue = document.getElementById('datevalue');
    const pID = document.getElementById('ID');
    formNewGame = document.getElementById('NewGame');

    //Sync Data from DB to Website
    //Create reference
    dbRefSpiele = firebase.database().ref().child('spiele');
    dbRefSpiele.orderByChild('Timestamp');

    //Sync object changes
    dbRefSpiele.on('value',
        snap => {
            allGames = snap.val();
            buildingHTML(allGames);
        }
    );

}());

function buildingHTML() {
    //Build Form NewGame
    formfields = {
        "mannschaft1": "text",
        "mannschaft2": "text",
        "wettbewerb": "text",
        "fortschritt": "text",
        "art": "text",
        "timestamp": "datetime",
        "bonuspunkte": "number",
        "length": "multiple"
    };
    var form = "";
    for (var i in formfields) {
        if (i == "length") {
            form += '<div class="input-field col s12"><select multiple id="length"><option value="" disabled selected>Choose Length</option><option value="90">90</option><option value="120">120</option><option value="11er">11er</option></select><label>Length</label></div>'
        } else if (i == "wettbewerb") {
            form += '<div class="col s12"><label for="' + i + '">' + i + '</label><input type="' + formfields[i] + '" id="' + i + '" name="' + i + '" /></div>';
        } else {
            form += '<div class="col s12 m6"><label for="' + i + '">' + i + '</label><input type="' + formfields[i] + '" id="' + i + '" name="' + i + '" /></div>';
        }
    };
    formNewGame.innerHTML = form;

    //Build Table of exisiting Games
    var table = '<thead><tr>';
    for (var i in formfields) {
        table += '<th data-field="' + i + '">' + i + '</th>';
    }
    table += '</tr></thead><tbody>';
    for (var j in allGames) {
        table += '<tr>';
        for (var i in formfields) {
            if (i == "length") {
                lengthforTable = allGames[j][i];
                var lengthforTablePrint = '';
                for (var t in lengthforTable) {
                    lengthforTablePrint += lengthforTable[t] + '|';
                }
                lengthforTablePrint = lengthforTablePrint.substring(0, lengthforTablePrint.length - 1);
                table += '<td>' + lengthforTablePrint + '</td>';
            } else if (i == "timestamp") {
                table += '<td>' + new Date(allGames[j][i]).toLocaleString() + '</td>';
            } else {
                table += '<td>' + allGames[j][i] + '</td>';
            }
        }
        passID = "'" + j + "'";
        useID = j;
        table += '<td><input class="btn" name="edit" type="submit" value="Edit" onclick="editGames(allGames,' + passID + ')" /></td>';
        table += '<td><input class="btn" name="deleteshow'+useID+'" type="submit" value="Delete" id="deleteshow'+useID+'" onclick="showDeleteButton('+passID+')" /><input class="btn red" style="display: none;" name="reallydelete'+useID+'" id="reallydelete'+useID+'" type="submit" value="Really?" onclick="deleteGame('+passID+')"/></td>';
        table += '</tr>';
    }
    table += '</tbody>';

    tableGamesinDB.innerHTML = table;

    $(document).ready(function() {
        $('select').material_select();
        $(".button-collapse").sideNav();
    });
}

function editGames(allGames, ID) {
    //insert all values into form from line in table
    console.log(allGames[ID]);
    document.getElementById('mannschaft1').value = allGames[ID].mannschaft1;
    document.getElementById('mannschaft2').value = allGames[ID].mannschaft2;
    document.getElementById('wettbewerb').value = allGames[ID].wettbewerb;
    document.getElementById('fortschritt').value = allGames[ID].fortschritt;
    document.getElementById('art').value = allGames[ID].art;
    document.getElementById('timestamp').value = new Date(allGames[ID].timestamp).toString();
    document.getElementById('bonuspunkte').value = allGames[ID].bonuspunkte;
    document.getElementById('length') = allGames[ID].length;
}

function submitNewGame() {
    //Get Data from Submit Form
    var mannschaft1 = document.getElementById('mannschaft1').value;
    var mannschaft2 = document.getElementById('mannschaft2').value;
    var wettbewerb = document.getElementById('wettbewerb').value;
    var fortschritt = document.getElementById('fortschritt').value;
    var art = document.getElementById('art').value;
    var timestamp = document.getElementById('timestamp').value;
    var bonuspunkte = document.getElementById('bonuspunkte').value;
    var length = document.getElementById('length');

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
    var identification = datevalue.toString() + mannschaft1.replace(/\W+/g, '') + mannschaft2.replace(/\W+/g, '');

    //Create JSON Object
    var newEntry = '{  "' + identification + '": {  "art": "' + art + '",        "bonuspunkte": ' + bonuspunkte + ',        "fortschritt": "' + fortschritt + '", "length":' + length + ',        "mannschaft1": "' + mannschaft1 + '",        "mannschaft2": "' + mannschaft2 + '",    "timestamp": ' + datevalue + ',      "wettbewerb": "' + wettbewerb + '"}}';
    var newEntry = jQuery.parseJSON(newEntry);
    console.log(newEntry);

    //Send Object to DB
    dbRefSpiele.update(newEntry);

};
function showDeleteButton(useID){
      $("#deleteshow"+useID).hide();
      $("#reallydelete"+useID).show();
}
function deleteGame(ID){
  dbRefTest = firebase.database().ref('spiele/'+ID);
  dbRefTest.remove();
}

function pageBuilder() {
    //Build all elements of the page
    $("#navigation").load('/inc/navigation.html');
    $("#footer").load('/inc/footer.html');
}
