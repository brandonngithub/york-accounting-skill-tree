var rootDiv;

function setup() {
    var allBoxes = document.getElementsByClassName("classBox");
    rootDiv = document.getElementById("root");

    for (var ct = 0; ct < allBoxes.length; ct++) {
        allBoxes[ct].addEventListener("mouseover", boxOnHover);
        allBoxes[ct].addEventListener("mouseout", boxOnLeave);
        allBoxes[ct].addEventListener("click", boxOnClick);
    }
    rootDiv.addEventListener("click", rootDivClicked);

    setupArrows();
    document.getElementById("zoom-range-slider").addEventListener("input", zoom_slider_update);
    document.getElementById("zoom-range-slider").addEventListener("change", zoom_slider_update);
}
function setupArrows() {
    var classBoxes = document.getElementsByClassName("classBox");

    for (var i = 0; i < classBoxes.length; i++) {
        var boxx = classBoxes[i];
        var preq = boxx.getAttribute("prereq");
        if (preq) {
            var preqs = preq.split(" ");
            for (var j = 0; j < preqs.length; j++) {
                var prereq_tag = preqs[j];
                var ancestor = document.getElementById(prereq_tag);
                if (ancestor) {
                    var clon = document.createElementNS("http://www.w3.org/2000/svg", 'line');
                    clon.setAttribute("style", "stroke:rgb(0,0,0);stroke-width:1");
                    clon.setAttribute("marker-end", "url(#arrow)");
                    var x1 = parseFloat(ancestor.style.left) + 6;
                    var y1 = parseFloat(ancestor.style.top) + 4.5;
                    var x2 = parseFloat(boxx.style.left) + 6;
                    var y2 = parseFloat(boxx.style.top);
                    clon.setAttribute("x1", x1 + "em");
                    clon.setAttribute("y1", y1 + "em");
                    clon.setAttribute("x2", x2 + "em");
                    clon.setAttribute("y2", y2 + "em");
                    clon.classList.add(prereq_tag);
                    clon.classList.add(boxx.getAttribute("id"));
                    document.getElementsByClassName("svgConns")[0].appendChild(clon);
                }
            }
        }
    }
}
function boxOnHover(event) {
    if (box_focused != false) {
        return;
    }
    var source = event.target || event.srcElement;
    highlightCourse(source);
}
function highlightCourse(source) {
    while (!source.classList.contains("classBox")) {
        source = source.parentElement;
    }
    var sourceId = source.id;
    var allElements = rootDiv.getElementsByClassName("classBox");
    for (var ct = 0; ct < allElements.length; ct++) {
        allElements[ct].style.opacity = "0.3";
    }

    source.style.opacity = "1.0";
    var arrows = document.getElementsByClassName(sourceId);
    for (var ct = 0; ct < arrows.length; ct++) {
        var related = arrows[ct].classList;
        for (var ctt = 0; ctt < related.length; ctt++) {
            if (document.getElementById(related[ctt])) {
                document.getElementById(related[ctt]).style.opacity = "1.0";
            }
        }
    }
    var allArrows = rootDiv.getElementsByTagName("line");
    for (var ct = 0; ct < allArrows.length; ct++) {
        allArrows[ct].style.opacity = "0.08";
    }
    for (var ct = 0; ct < arrows.length; ct++) {
        arrows[ct].style.opacity = "1.0";
    }
}

function boxOnLeave() {
    if (box_focused != false) {
        return;
    }
    showAllElements();
}

function showAllElements() {
    var allElements = rootDiv.getElementsByTagName("*");
    for (var ct = 0; ct < allElements.length; ct++) {
        allElements[ct].style.opacity = "1.0";
    }
}
var box_focused = false;
function boxOnClick(event) {
    var source = event.target || event.srcElement;
    focusBox(source);
}
function focusBox(source) {
    while (!source.classList.contains("classBox")) {
        source = source.parentElement;
    }
    box_focused = source.id;
    highlightCourse(source);
    document.getElementById("explain-main").style.display = "block";
    document.getElementById("explain-hint").style.display = "none";
    var course_code_full = source.getElementsByClassName("course-code-full")[0].innerHTML;
    var course_name = source.getElementsByClassName("course-name")[0].innerHTML;
    var course_title = course_code_full + "<br>" + course_name;
    document.getElementById("explain-topp").innerHTML = course_title;
    var description_hidden = source.getElementsByClassName("course-description")[0].innerHTML;
    document.getElementById("explain-desc").innerHTML = description_hidden;
    var prereq_div = document.getElementById("explain-prereq-list-div");
    var prereq_ul = document.getElementById("explain-prereq-list");
    var prereqs = source.getAttribute("prereq");
    if (prereqs === "") {
        prereq_div.style.display = "none";
    } else {
        prereq_div.style.display = "block";
        prereq_ul.innerHTML = "";
        var prereqs_split = prereqs.split(" ");
        for (var i = 0; i < prereqs_split.length; i++) {
            prereq_ul.innerHTML += "<li>" + prereqs_split[i] + "</li>";
        }
    }
}
function unfocusBox() {
    box_focused = false;
    showAllElements();
    document.getElementById("explain-main").style.display = "none";
    document.getElementById("explain-hint").style.display = "block";
}
function rootDivClicked(event) {
    var source = event.target || event.srcElement;
    if (!source.classList.contains("classBox") && !source.classList.contains("course-code-full") && !source.classList.contains("course-name")) {
        unfocusBox();
    }
}
function zoom_slider_update(event) {
    var zoom_value = event.target.value;
    document.getElementById("zoom-value").innerHTML = zoom_value;
    rootDiv.style.fontSize = (zoom_value + "em");
}
document.addEventListener("DOMContentLoaded", setup);
