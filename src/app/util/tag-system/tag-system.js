//tags list, will get this from a database through an API
const tags = ["Yo", "Pepe", "Cancer", "Forsen", "Normie", "Gif", "Wide"];

//Constructs a tag, expects a place where to construct it and a tag name
function constructTag(parent, tag) {
    let tagCont = document.createElement("span");
    tagCont.classList.add("tag");
    parent.appendChild(tagCont);
    tagCont.innerHTML = tag;
}

//Makes a tag list form data
function tagList() {
    const list = document.querySelector("#tagList");
    tags.forEach(tag => {
        constructTag(list, tag);
    });
}

/*
END OF TAG LIST
*/

//DOESN'T WORK YET
/*
function autoComplete(tagInput) {
    let str = "";
    tagInput.addEventListener('keyup', (e) => {
        if ((e.code >= 48 && e.code <= 57) || (e.code >= 65 && e.code <= 90)) {
            str += e.key;
            console.log(str);
        }
        if (e.code == 8)
            str.slice(0, -1);
        console.log(str);
    });
}
*/

/*
START OF ADDING TAGS
*/


//Adds a tag to an input div, expects that div to be passed
function newTag(tagInput) {
    //finds an input box
    const addATag = tagInput.querySelector("#addATag");

    if (addATag.value.length > 2) {
        if (addATag.value.slice(-1) == ",")//if you press a , don't include it in a tag
            addATag.value = addATag.value.slice(0, -1);

        constructTag(tagInput, addATag.value);
        //TODO call an api to add a tag

        //remove the input
        addATag.remove();
        tagInput.appendChild(addATag);
        addATag.value = "";
        addATag.focus();
    }
}


function tagsComplete() {
    //finds the tag input DIV
    const tagInput = document.querySelector("#tagArea");

    //listen for input in the area
    tagInput.addEventListener('keyup', (e) => {
        autoComplete(tagInput);
        if (e.key == "," || e.key == "Enter") {//pressing enter or , adds a new tag
            newTag(tagInput);
        }
    });
}



function run() {
    tagList();
    tagsComplete();
}

document.addEventListener("DOMContentLoaded", run);

