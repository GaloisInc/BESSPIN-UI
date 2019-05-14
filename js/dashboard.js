function refresh_db_models() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/dashboard/get_db_models');
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
                cell_number.innerHTML = "<a href=\"/configurator/" + value['uid'] + "\">" + String(row_index) + "</a>";
                cell_filename.innerHTML = value['filename'];
                cell_start.innerHTML = value['date'];
                cell_last.innerHTML = "";
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
