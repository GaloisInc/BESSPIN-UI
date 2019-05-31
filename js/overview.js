
function make_fas(symb){
    return "<i class=\"fas fa-" + symb + "\"></i>";

}

function make_hyperlink(path, id, cont){
    // <a href="path/id"> cont </a>
    return "<a href=\"/" + path + "/" + id + "\">" + cont + "</a>";
}

function refresh_db_models() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/overview/get_db_models');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('Response from server: ' + xhr.responseText);
            var table = document.getElementById("db_table_info");

            /* empty the rows in the table */
            $("#db_table_info tbody").empty()

            /* populate the table with the db info */
            var row_index = 1; /* starts at index 1 after the `thead` */
            $.each(JSON.parse(xhr.responseText), function(key, value) {
                console.log('INS');
                console.log(row_index);
                var row = table.insertRow(row_index);
                var cell_number = row.insertCell(0);
                var cell_filename = row.insertCell(1);
                var cell_start = row.insertCell(2);
                var cell_last = row.insertCell(3);
                var cell_nb_features_selected = row.insertCell(4);
                cell_number.innerHTML =
		    make_hyperlink("configurator", value['uid'], String(row_index)) + " " +
		    make_hyperlink("configurator", value['uid'], make_fas("cog")) + " " +
		    make_hyperlink("pipeline", value['uid'], make_fas("tasks")) + " " +
		    make_hyperlink("dashboard", value['uid'], make_fas("chart-bar"));
                cell_filename.innerHTML = value['filename'];
                cell_start.innerHTML = value['date'];
                cell_last.innerHTML = value['last_update'];
                cell_nb_features_selected.innerHTML = value['nb_features_selected'];
                row_index += 1;
            });
        }
        else {
            alert('Request failed.  Returned status of ' + xhr.status);
        }
    };
    xhr.send();
};

refresh_db_models();
