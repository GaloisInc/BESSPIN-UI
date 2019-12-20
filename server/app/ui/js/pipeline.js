var editor_pipeline = ace.edit("editor_pipeline");
editor_pipeline.setTheme("ace/theme/monokai");
editor_pipeline.session.setMode("ace/mode/python");
editor_pipeline.getSession().selection.on(
    'changeSelection',
    function (e) { editor_pipeline.getSession().selection.clearSelection(); }
);
