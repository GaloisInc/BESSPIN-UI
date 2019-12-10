import {
    SelectionMode,
    ISelectionType,
} from './system';


export type ISelection = ISelectionType[]

export function selection_mem(this_selection: ISelection, uid: string): boolean {
    var sel = this_selection.find(entry => entry.uid === uid);
    if (sel === undefined) {
        return false;
    } else {
        return true;
    }
};

export function selection_search(this_selection: ISelection, uid: string): ISelectionType {
    const elm = this_selection.find( entry => entry.uid === uid);
    if (elm === undefined) {
        return { uid: 'notFound', mode: SelectionMode.unselected, other: 'notFound', isValid: false };
    } else {
        return { ...elm };
    }
};

export function selection_search_index(this_selection: ISelection, uid: string): number {
    var index = this_selection.findIndex( entry => entry['uid'] === uid);
    return index;
};

export function selection_from_json(this_selection: ISelection): ISelection{
    if (! Array.isArray(this_selection))
        alert("from json: selection not an array");
    return this_selection;
};

export function selection_to_json(this_selection: ISelection): ISelection{
    if (! Array.isArray(this_selection))
        alert("to_json: selection not an array");
    return this_selection;
};

export function selection_remove(this_selection: ISelection, uid: string): ISelection{
    return this_selection.filter(entry => entry.uid !== uid);
};

export function selection_reset(this_selection: ISelection, uid: string): ISelection{
    return [];
};

export function selection_top(this_selection: ISelection) : ISelectionType {
    return this_selection[0];
};

export function selection_push(
        this_selection: ISelection,
        uid: string,
        mode: SelectionMode,
        other: string,
        isValid: boolean
    ) : ISelection {
    var sel : ISelectionType = { uid, mode, other, isValid };
    return [sel].concat(this_selection);
};

export function selection_push_elm(
    this_selection: ISelection,
    elm : ISelectionType,
) : ISelection {

    return [elm].concat(this_selection);
};

export function selection_pop(this_selection: ISelection) : ISelection {
    return this_selection.slice(1);
};

export function selection_get_mode(this_selection: ISelection, uid: string): SelectionMode {
    var index = selection_search_index(this_selection, uid);
    return this_selection[index].mode;
};

export function selection_get_validated(this_selection: ISelection, uid: string): boolean {
    var index = selection_search_index(this_selection, uid);
    return this_selection[index].isValid;
};

export function selection_change_mode(this_selection: ISelection, uid: string, mode: SelectionMode){
    var index = selection_search_index(this_selection, uid);
    var newsel = ([] as ISelection).concat(this_selection);
    newsel[index].mode = mode;
    return newsel;
};

export function selection_change_validated(this_selection: ISelection, uid: string, is_validated: boolean){
    var index = selection_search_index(this_selection, uid);
    var newsel = ([] as ISelection).concat(this_selection);
    newsel[index].isValid = is_validated;
    return newsel;
};

export function selection_all_validated(this_selection: ISelection): boolean {
    var index = this_selection.findIndex( entry => entry.isValid === false);
    if (index === -1)
        return true;
    else
        return false;
};