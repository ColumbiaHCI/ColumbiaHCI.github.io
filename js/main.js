$(document).ready(function () {
    load_people();
    load_publications();

    // update elements on scroll
    $(window).scroll(function(){
        var distance = $(window).scrollTop();
        $('.section').each(function (i) {
            if ($(this).position().top <= distance + 50) {
                $('.navbar-nav a').removeClass('active');
                $('.navbar-nav a').eq(i).addClass('active');
            }
        });
    });

    // Uncollapse all sections when a user starts searching with Ctrl+F
    $(window).on('keydown', function(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
            $('.year-content').each(function() {
                const yearContent = $(this);
                const arrow = yearContent.siblings('.year-header').find('.arrow');
                if (!yearContent.is(':visible')) {
                    yearContent.show();
                    arrow.html('&#9660;');
                }
            });
        }
    });
});

function load_people() {
  // load people data
  csvData = $.ajax({
      type: "GET",
      url: "data/people.csv",
      dataType: "text/csv",
      async: false
  });

  console.log("CSV data: " + csvData.responseText);

  // Split the data into an array of lines
  const csvLines = csvData.responseText.toString().split(/\r\n|\n/);

  let students = [];
  let labs = [];

  let colors = ['#9B2F7A', '#379DD4', '#61BA84', '#E1B917', '#003865'];

// Shuffle function to shuffle the colors array
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

colors = shuffle(colors); // Shuffle the colors

let colorIndex = 0; // Start from the first color


  for (let i = 1; i < csvLines.length; i++) {
      const data = csvLines[i].split(',');
      const person = {
          role: data[0],
          name: data[1],
          page_url: data[2],
          pic_url: data[3],
          lab: data[4],
          lab_url: data[5]
      }

      if (person.role.indexOf("phd") >= 0) {
          students.push(person);
      } else {
          labs.push(person);
      }
  }

  // Sort students by name
  students.sort((a, b) => a.name.localeCompare(b.name));

  // Clear containers
  let people_container = $("#people-section").empty();
  let labs_container = $("#about-labs").empty();

  // Populate student cards
for (let student of students) {
    let card = document.createElement('div');
    $(card).addClass('col-6 col-lg-2 col-sm-4 align-self-center zoom').appendTo(people_container);
    $(card).html(`
    <div class="rect-img-container"><a href="${student.page_url}">
            <img src="./media/headshots/${student.pic_url}" alt="" style="height: auto; width: 100%;">
        </a></div>
        <div class="mb-3" style="background-color: #9B2F7A">
            <p style="font-size: 1rem; font-weight: 500 !important; padding: .5rem .5rem 0 .75rem; margin: 0 !important; text-align: left; color: white;">${student.name}</p>
            <a class="cryptedmail" href="${student.page_url}"><svg xmlns="http://www.w3.org/2000/svg" height="0.6rem" viewBox="0 0 640 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#ffffff}</style><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/></svg> Personal Website</a>
        </div>`);
        $(card).find('.mb-3').css('background-color', colors[colorIndex % colors.length]);
        colorIndex++;
}

// Populate lab cards
for (let lab of labs) {
    let card = document.createElement('div');
    $(card).addClass('col-6 col-lg-2 col-sm-4 align-self-center zoom').appendTo(labs_container);
    $(card).html(`
    <div class="rect-img-container"> <a href="${lab.lab_url}">
            <img src="./media/headshots/${lab.pic_url}" alt="" style="height: auto; width: 100%;">
        </a></div>
        <div class="mb-3" style="background-color: #9B2F7A">
            <p style="font-size: 1rem; font-weight: 500 !important; padding: .5rem .5rem 0 .75rem; margin: 0 !important; text-align: left; color: white;">${lab.name}</p>
            <a class="cryptedmail" href="${lab.lab_url}"><svg xmlns="http://www.w3.org/2000/svg" height="0.6rem" viewBox="0 0 576 512"><style>svg{fill:#ffffff}</style><path d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z"/></svg> ${lab.lab}</a>
        </div>`);
        $(card).find('.mb-3').css('background-color', colors[colorIndex % colors.length]);
colorIndex++;
    
}
}

function load_publications() {
    const csvData = $.ajax({
        type: "GET",
        url: "data/publications.csv",
        dataType: "text/csv",
        async: false
    });

    const csvLines = csvData.responseText.split(/\r\n|\n/);
    const publications = csvLines.map(line => {
        const tokens = line.split(',');
        return {
            year: tokens[0],
            conference: tokens[1],
            title: tokens[3],
            authors: tokens[4],
            doi: tokens[6]
        };
    });

    const groupedPublications = groupByYearAndConference(publications);
    
    const publication_container = $("#publication-section");
    publication_container.empty();

    // Extract distinct years and sort in descending order
    const sortedYears = Object.keys(groupedPublications).sort((a, b) => b - a);

    const currentYear = new Date().getFullYear();

    // Use sortedYears for iteration
    for (const year of sortedYears) {
        const publicationCount = Object.values(groupedPublications[year]).reduce((sum, confPubs) => sum + confPubs.length, 0);
        const yearDiv = $('<div>').addClass('year-section').css('width', '100%').appendTo(publication_container);
        const yearHeader = $(`<div class="year-header" style="cursor: pointer; margin-bottom: 10px; font-weight: bold;">
                                <span class="arrow">&#9654;</span> ${year} (${publicationCount})
                             </div>`).appendTo(yearDiv);
        
        const yearContent = $('<div>').addClass('year-content').appendTo(yearDiv);
        
        // Only show the current year's content by default, hide others
        if (parseInt(year) === currentYear) {
            yearContent.show();
            yearHeader.find('.arrow').html('&#9660;'); // Change arrow to down for expanded content
        } else {
            yearContent.hide();
        }

        yearHeader.on('click', function() {
            toggleYearContent(yearContent, $(this).find('.arrow'));
        });
    
        const conferenceContainer = $('<div>').appendTo(yearContent);  // New container for conferences
        for (const conference in groupedPublications[year]) {
            const conferenceDiv = $('<div>').addClass('conference mb-3').appendTo(conferenceContainer);  // Appending to conferenceContainer now
            $('<h4>').text(conference).appendTo(conferenceDiv);
            
            groupedPublications[year][conference].forEach(pub => {
                const entry_card = $('<div>').addClass('publication-card mb-3').appendTo(conferenceDiv);
                
                const linkIcon = "<a target='_blank' style='padding-right: 20px' href='" + pub.doi + "'><i class='far fa-file'></i></a>";

                const pubTitle = "<a target='_blank' href='" + pub.doi + "'><b>" + pub.title + "</b></a>";
                const authors = pub.authors.split(':').join(',');

                $('<div>').addClass('icon').html(linkIcon).appendTo(entry_card);
                $('<div>').addClass('details').html(pubTitle + '<br>' + authors).appendTo(entry_card);
            });
        }
    }
}

function groupByYearAndConference(publications) {
    return publications.reduce((acc, pub) => {
        if (!acc[pub.year]) acc[pub.year] = {};
        if (!acc[pub.year][pub.conference]) acc[pub.year][pub.conference] = [];
        acc[pub.year][pub.conference].push(pub);
        return acc;
    }, {});
}

function toggleYearContent(yearContent, arrowElement) {
    if (yearContent.is(':visible')) {
        yearContent.slideUp();
        arrowElement.html('&#9654;'); // Change arrow to right for collapsed content
    } else {
        yearContent.slideDown();
        arrowElement.html('&#9660;'); // Change arrow to down for expanded content
    }
}


window.smartlook||(function(d) {
  var o=smartlook=function(){ o.api.push(arguments)},h=d.getElementsByTagName('head')[0];
  var c=d.createElement('script');o.api=new Array();c.async=true;c.type='text/javascript';
  c.charset='utf-8';c.src='https://web-sdk.smartlook.com/recorder.js';h.appendChild(c);
  })(document);
  smartlook('init', '09828cf706421904fa1a2ea8eb3e1133703abced', { region: 'eu' });
