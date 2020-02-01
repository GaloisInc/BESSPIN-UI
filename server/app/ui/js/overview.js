
function make_fas(symb){
    return "<i class=\"fas fa-" + symb + "\"></i>";

}

function make_hyperlink(path, id, cont){
    // <a href="path/id"> cont </a>
    return "<a href=\"/" + path + "/" + id + "\">" + cont + "</a>";
}

function make_button(path, subpath, cont){
    return "<a href=\"/"+ path + "/" + subpath + "\"" + " class=\"btn btn-info\" role=\"button\">" + cont + "</a>";
}

function refresh_db_models() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/overview/get_db_models');
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
                var cell_configure = row.insertCell(5);
                var cell_testconfig = row.insertCell(6);
                var cell_run = row.insertCell(7);
                var cell_uid = row.insertCell(8);
                cell_number.innerHTML = make_hyperlink("configurator", value['uid'], String(row_index));
                cell_filename.innerHTML = value['filename'];
                cell_uid.innerHTML = value['uid'];
                cell_start.innerHTML = value['createdAt'];
                cell_last.innerHTML = value['updatedAt'] || '';
                cell_nb_features_selected.innerHTML = value['nb_features_selected'];
                cell_configure.innerHTML = make_button("configurator", 'cpu' + '/' + value['uid'], "CONF");
                cell_testconfig.innerHTML = make_button("configurator", 'test' + '/' + value['uid'], "TEST");
                cell_run.innerHTML = make_button("pipeline", value['uid'], "RUN");
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
