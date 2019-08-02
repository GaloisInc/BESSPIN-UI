var editor_source = ace.edit("editor_source");
editor_source.setTheme("ace/theme/monokai");
editor_source.session.setMode("ace/mode/python");
editor_source.getSession().selection.on(
    'changeSelection',
    function (e) { editor_source.getSession().selection.clearSelection(); }
);


var editor_configs = ace.edit("editor_configs");
editor_configs.setTheme("ace/theme/monokai");
editor_configs.session.setMode("ace/mode/python");
editor_configs.getSession().selection.on(
    'changeSelection',
    function (e) { editor_configs.getSession().selection.clearSelection(); }
);

// Global guid http://guid.us/GUID/JavaScript
// currently not using it, but was thinking of using it for token generation
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

// then to call it, plus stitch in '4' in the third group
guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
console.log('The GUID is '+ guid);


//document.getElementById('cfr_file').addEventListener('change', handleFileSelect, false);


/*var nodes = new vis.DataSet([
  {id: 1, label: "N1"},
  {id: 2, label: "N2"},
  ...
  ]);

  var edges = new vis.DataSet([
  {from: 1, to:2, id: "e1"},
  {from: 1, to:3, id: "e2"},
  ...
  ]);
*/


function selection_mem(uid){
    var sel = this.selection.find(entry => entry['uid'] == uid);
    if (sel == undefined) {
        return false;
    } else {
        return true;
    }
};

function selection_search(uid){
    var sel = this.selection.find( entry => entry['uid'] == uid);
    return sel;
};

function selection_search_index(uid){
    var index = this.selection.findIndex( entry => entry['uid'] == uid);
    return index;
};

function selection_from_json(content){
    if (! Array.isArray(content))
        alert("from json: selection not an array");
    this.selection = content;
};

function selection_to_json(){
    if (! Array.isArray(this.selection))
        alert("to_json: selection not an array");
    return this.selection;
};

function selection_remove(uid){
    this.selection = this.selection.filter(entry => entry.uid != uid);
};

function selection_reset(uid){
    this.selection = [];
};

function selection_push(uid, mode, other, isvalid){
    this.selection.push(
        { 'uid': uid,
          'content': {
              'mode': mode,
              'other': other,
              'validated': isvalid,
          },
        });
};

function selection_push_elm(elm){
    this.selection.push(elm);
};

function selection_pop(){
    return this.selection.pop();
};

function selection_change(uid, content){
    var index = this.search_index(uid);
    this.selection[index] = { 'uid': uid, 'content': content};
};

function selection_get_mode(uid){
    var index = this.search_index(uid);
    return this.selection[index]['content']['mode'];
};

function selection_get_validated(uid){
    var index = this.search_index(uid);
    return this.selection[index]['content']['validated'];
};

function selection_change_mode(uid, mode){
    var index = this.search_index(uid);
    this.selection[index]['content']['mode'] = mode;
};

function selection_change_validated(uid, is_validated){
    var index = this.search_index(uid);
    this.selection[index]['content']['validated'] = is_validated;
};

function selection_all_validated(){
    var index = this.selection.findIndex( entry => entry['content']['validated'] == false);
    if (index == -1)
        return true;
    else
        return false;
};

function Selection() {
    // instance variable
    this.selection = [];

    // methods
    this.mem = selection_mem;
    this.search = selection_search;
    this.search_index = selection_search_index;
    this.reset = selection_reset;
    this.to_json = selection_to_json;
    this.from_json = selection_from_json;
    this.remove = selection_remove;
    this.push = selection_push;
    this.push_elm = selection_push_elm;
    this.pop = selection_pop;
    this.change = selection_change;
    this.get_mode = selection_get_mode;
    this.get_validated = selection_get_validated;
    this.change_mode = selection_change_mode;
    this.change_validated = selection_change_validated;
    this.all_validated = selection_all_validated;
};


// this is a global feature configuration tree, received from the server
var global_filename = 'modelnameplaceholder';
var global_conftree = {};
var global_uid = '';

// the dictionary containing the set of nodes that are selected by
// the user by clicking.
var global_selected_nodes = new Selection();
var global_redo_selection = [];

// Sets for nodes and edges of the tree visualization artifact (visjs)
var nodes = new vis.DataSet([]);
var edges = new vis.DataSet([]);

var data = {
    nodes: nodes,
    edges: edges
};

// create a network
var container = document.getElementById('network');
var options = {
    layout: {
        hierarchical: {
            direction: "LR",
            sortMethod: "directed",
            nodeSpacing: 70,
            levelSeparation: 300,
        }
    },
    interaction: {
        dragNodes :false,
        selectConnectedEdges: false,
    },
    physics: {
        enabled: false
    },
    // configure: {
    //     filter: function (option, path) {
    //   if (path.indexOf('hierarchical') !== -1) {
    //       return true;
    //   }
    //   return false;
    //     },
    //     showButton:false
    // },
    // manipulation: {
    //     editNode: function (data, callback) {
    //   // filling in the popup DOM elements
    //   document.getElementById('node-operation').innerHTML = "Feature Selection";
    //   editNode(data, cancelNodeEdit, callback);
    //     },
    // }
};

// from a node n, returns the edges to root
function edges_to_root(n){

    var res = new Array();
    var edges_ids = edges.getIds();

    nodes.update({'id': n, 'shape': 'box'});

    var edge;
    for (eid in edges_ids) {
        edge = edges.get(edges_ids[eid]);
        if (edge['to'] === n) {
            res = res.concat([edge['id']]);

            edges.update({'id': edges_ids[eid], 'dashes': false});
            nodes.update({'id': edges.get(edges_ids[eid])['to'], 'shape': 'box'});
            nodes.update({'id': edges.get(edges_ids[eid])['from'], 'shape': 'box'});
            var r;
            r = edges_to_root(edge['from']);
            res = res.concat(r);
        }
    }
    // console.log("Edges to root for node: " + res.toString());
    return res;
};

function shade_edges(){
    var edges_ids = edges.getIds();

    var edge;
    for (eid in edges_ids) {
        edges.update({'id': edges_ids[eid], 'dashes': true});
        nodes.update({'id': edges.get(edges_ids[eid])['to'], 'shape': 'text'});
        nodes.update({'id': edges.get(edges_ids[eid])['from'], 'shape': 'text'});
    }
};

function compare_card(arr1, arr2){
    if (arr1.length != arr2.length)
        return false;

    if (arr1.length != 2)
        return false;

    if (arr1[0] == arr2[0] && arr1[1] == arr2[1])
        return true;

    return false;
};

function set_validate_button_success(){
    var validate_button = $('#validate-features-button');
    validate_button.removeClass("btn-primary");
    validate_button.addClass("btn-success");
};

function set_validate_button_active(){
    var validate_button = $('#validate-features-button');
    validate_button.removeClass("btn-success");
    validate_button.addClass("btn-primary");
};

function update_validate_button(){
    set_validate_button_active();
};

// returns the list of nodes and edges from a node d
function conftree_to_nodes_and_edges(conftree) {
    console.assert(conftree.hasOwnProperty('features'));

    var n = new Array();
    var e = new Array();

    var features = conftree.features;
    for (var feature in features) {
        var fields = features[feature];
        var card = fields.card;
        var color = '';

        switch (card) {
        case 'on': {
            color = '#ddffdd';
            break;
        };
        case 'off': {
            color = '#ffdddd';
            break;
        };
        case 'opt': {
            color = '#ffffff';
            break;
        };
        };

        if (global_selected_nodes.mem(feature)) {
            switch (global_selected_nodes.get_mode(feature)) {
            case 'selected': {
                if (global_selected_nodes.get_validated(feature))
                    color = '#99ff99';
                else
                    color = '#00dd00';
                card = "on";
                break;
            };
            case 'rejected': {
                if (global_selected_nodes.get_validated(feature))
                    color = '#ff9999';
                else
                    color = '#dd0000';
                card = "off";
                break;
            };
            };
        }

        var node1 = {
            'id': feature,
            'label': feature + '\n [' + card + ']\n ' + 'gcard: ' + fields.gcard,
            'shape': 'box',
            'color': color,
        };
        n = n.concat(node1)

        for (var i in fields.children) {
            var d1 = fields.children[i];

            e = e.concat([{
                'id': feature + d1,
                'label': '',
                'from': feature,
                'to': d1,
                'dashes': false,
                'color': '#fff',
            }]);
        }
    }
    return {'nodes': n, 'edges': e, 'topnodecard': card};
};

function draw_conftree(conftree){
    var ch = conftree_to_nodes_and_edges(conftree);
    update_validate_button();
    nodes.clear();
    edges.clear();
    nodes.add(ch.nodes);
    edges.add(ch.edges);
}


function update_conftree(tree, uid, key, value) {
    console.log('update_conftree');
    console.log(tree['uid']);
    if (tree['uid'] == uid) {
        tree[key] = value;
        return;
    }
    for (var elem in tree['group']) {
        update_conftree(tree['group'][elem], uid, key, value);
    }
    return;
};

function find_feature_conftree(tree, name) {
    console.assert('features' in tree, Object.keys(tree));
    console.assert(name in tree.features, name, Object.keys(tree.features));
    return tree.features[name];
};

function path_to_feature(tree, name) {
    var path = "";
    var cur_name = name;
    while (! tree.roots.includes(cur_name)) {
        if (path == "") path = cur_name; else path = cur_name + "." + path;
        var parent = tree.features[cur_name].parent;
        if (parent == undefined)
            alert("wrong path leading to the sky");
        cur_name = parent;
    }
    return path;
};

var global_var_cpu = "cpu";
var global_var_test = "test";

function handleFileSelect(evt, cfg_type) {
    /* snippet from https://blog.garstasio.com/you-dont-need-jquery/ajax/
       The second one was chosen. */

    /*var formData = new FormData(),
      file = document.getElementById('cfr_file').files[0],
      xhr = new XMLHttpRequest();

      formData.append('file', file);
      xhr.open('POST', '/upload/');
      xhr.send(formData);
    */

    var file = document.getElementById('cfr_file').files[0];
    console.log(file);
    console.log(file.name);
    console.log("cfr_file" + cfg_type);
    global_filename = file.name;
    xhr = new XMLHttpRequest();
    var route = '/configurator/upload/' + file.name + '/' + cfg_type;
    xhr.open('POST', route);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('Response from server: ' + xhr.responseText);
            response = JSON.parse(xhr.responseText);
            global_conftree = response['tree'];
            global_uid = response['uid'];
            global_selected_nodes.reset();
            draw_conftree(global_conftree);
        }
        else {
            alert('Request failed.  Returned status of ' + xhr.status);
        }
    };
    console.log(file.type);
    xhr.send(file);
};

function validate_features() {
    /* Ajax in pure javascript instead of jQuery */
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/configurator/configure/');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('Response from server: ' + xhr.responseText);
            var response = JSON.parse(xhr.responseText);

            var editor_source = ace.edit("editor_source");
            editor_source.setValue(response['server_source']);
            var editor_configs = ace.edit("editor_configs");
            editor_configs.setValue(response['server_constraints']);

            global_selected_nodes.from_json(response['validated_features']);
            draw_conftree(global_conftree);
            set_validate_button_success();
        }
        else {
            alert('Request failed.  Returned status of ' + xhr.status);
        }
    };

    console.log(global_filename);
    xhr.send(JSON.stringify({
        'filename': global_filename,
        'uid': global_uid,
        'feature_selection': global_selected_nodes.to_json(),
    }));
};


function refresh_db_models() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/configurator/list_db_models');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('Response from server: ' + xhr.responseText);

            /* https://stackoverflow.com/questions/6364748/change-the-options-array-of-a-select-list */
            $('#db_models').empty();
            var db_models_options = $('#db_models').get(0);

            $.each(JSON.parse(xhr.responseText), function(key, value) {
                var opt = document.createElement('option');
                opt.text = value['filename'] + ' ' + value['date'];
                opt.value = value['uid'];
                db_models_options.add(opt, null);
            });
        }
        else {
            alert('Request failed.  Returned status of ' + xhr.status);
        }
    };
    xhr.send();
};

function load_configured_model(uid) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/configurator/load_from_db/');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('Response from server: ' + xhr.responseText);
            response = JSON.parse(xhr.responseText);
            global_conftree = response['conftree'];
            global_uid = response['uid'];
            global_filename = response['filename'];
            global_selected_nodes.from_json(response['configs']);
            draw_conftree(global_conftree);
            var editor_source = ace.edit("editor_source");
            editor_source.setValue(response['source']);
            var editor_configs = ace.edit("editor_configs");
            editor_configs.setValue(response['configs_pp']);
        }
        else {
            alert('Request failed.  Returned status of ' + xhr.status);
        }
    };
    if (uid == null) {
        var e = document.getElementById("db_models");
        var uid = e.options[e.selectedIndex].value;
    }
    xhr.send(JSON.stringify({'model_uid': uid}));
};

function download() {
    var editor_source = ace.edit("editor_source");
    var data = editor_source.getValue();
    var editor_configs = ace.edit("editor_configs");
    data = data + editor_configs.getValue();
    var type = "text/plain";
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = global_filename + '.configured';
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
};

function circle_selection(name) {
    var thenode = find_feature_conftree(global_conftree, name);

    if (global_selected_nodes.mem(name)) {
        switch (global_selected_nodes.get_mode(name)) {
        case 'selected': {
            global_selected_nodes.change_mode(name, 'rejected');
            global_selected_nodes.change_validated(name, false);
            return;
        };
        case 'rejected': {
            global_selected_nodes.remove(name);
            return;
        };
        };
    }

    switch (thenode.card) {
    case 'on': {
        return;
    };
    case 'off': {
        return;
    };
    case 'opt': {
        global_selected_nodes.push(name, 'selected', path_to_feature(global_conftree, name), false);
        return;
    };
    default: {
        alert('no choice');
    }
    };
};

function undo_selection(data) {
    var elm = global_selected_nodes.pop();
    global_redo_selection.push(elm);
    draw_conftree(global_conftree);
};

function redo_selection(data) {
    var elm = global_redo_selection.pop();
    if (elm != undefined && ! global_selected_nodes.mem(elm['uid']))
        global_selected_nodes.push_elm(elm);
    draw_conftree(global_conftree);
};


var network = new vis.Network(container, data, options);

network.on("click", function (params) {
    console.log('click event, getNodeAt returns: ' + this.getNodeAt(params.pointer.DOM));
    console.log("DOM id:" + typeof this.getNodeAt(params.pointer.DOM));
    circle_selection(this.getNodeAt(params.pointer.DOM));
    draw_conftree(global_conftree);
});

/*network.on("doubleClick", function (params) {
  console.log('doubleClick event, getNodeAt returns: ' + this.getNodeAt(params.pointer.DOM));
  console.log("DOM id:" + typeof this.getNodeAt(params.pointer.DOM));
  editNode(this.getNodeAt(params.pointer.DOM), cancelNodeEdit, function(data){});
  });*/
