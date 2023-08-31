$(document).ready(function () {
    load_people();
    load_publications();

    // update elements on scroll
    $(window).scroll(function(){
        var distance = $(window).scrollTop();
        $('.section').each(function (i) {
            if ($(this).position().top <= distance + 250) {
                $('.navbar-nav a').removeClass('active');
                $('.navbar-nav a').eq(i).addClass('active');
            }
        });
    });
});
  
// function load_people() {
//     // load people data
//     csvData = $.ajax({
//       type: "GET",
//       url: "data/people.csv",
//       dataType: "text/csv",
//       async: false
//     });
  
//     console.log("CSV data: "+ csvData.responseText);
  
//     // split the data into array of lines of type
//     const csvLines = csvData.responseText.toString().split(/\r\n|\n/);
//     data_role = csvLines.map(line => line.split(',')[0])
//     data_names = csvLines.map(line => line.split(',')[1])
//     data_page_url =csvLines.map(line => line.split(',')[2])
//     data_pic_url =csvLines.map(line => line.split(',')[3])
//     data_lab =csvLines.map(line => line.split(',')[4])
//     data_lab_url =csvLines.map(line => line.split(',')[5])
  
//     console.log("Numbers of people found: "+data_names.length);
  
//     let people_container = $("#people-section").empty()
//     let labs_container = $("#about-labs").empty()
//     for(var i = 1; i < data_names.length; i++)
//       {
//         let card = document.createElement('div');
//         if (data_role[i].indexOf("phd") >= 0) {
//           $(card).addClass('col-md-2 col-sm-4 col-4 people-card').appendTo($(people_container));
//           let card_content = document.createElement('div');
//           $(card_content).addClass('people-card-content').appendTo($(card));
//           $(card_content).html("<a target=_blank' href='"+data_page_url[i]+"'>"+
//           "<img src='./media/headshots/"+data_pic_url[i]+"' class='row people-image responsive-image center-align' /></a>"+
//           "<div class='row body-text pt-2 center-align'>Ph.D. Student</div>"+
//           "<div class='row people-name center-align'><strong>"+data_names[i]+"</strong></div>")
//         } else {
//           $(card).addClass('lab-card col-lg-2 col-md-4 col-sm-6 col-12').appendTo($(labs_container));
//           let card_content = document.createElement('div');
//           $(card_content).addClass('lab-card-content').appendTo($(card));
//           $(card_content).html("<a target=_blank' href='"+data_lab_url[i]+"'><div class='lab-title'>"+data_lab[i]+"</div></a>"+
//           "<a target=_blank' href='"+data_lab_url[i]+"'><img src='./media/headshots/"+data_pic_url[i]+"' class='row responsive-image center-align' /></a>"+
//           "<div class='row lab-professor-text pt-2 center-align'>"+data_names[i]+"</div>")
//         }
//       } 
// }

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

  let colors = ['#9B2F7A', '#379DD4', '#61BA84', '#E1B917'];

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
            <a class="cryptedmail" href="${student.page_url}"><i class='far fa-link' style="font-size:0.6rem"></i> Personal Website</a>
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
            <a class="cryptedmail" href="${lab.lab_url}"><i class="far fa-house" style="font-size:0.6rem"></i> ${lab.lab}</a>
        </div>`);
        $(card).find('.mb-3').css('background-color', colors[colorIndex % colors.length]);
colorIndex++;
    
}
}


// function load_publications() {
//     // load publication data
//     csvData = $.ajax({
//         type: "GET",
//         url: "data/publications.csv",
//         dataType: "text/csv",
//         async: false
//     });   

//     console.log("CSV data: "+ csvData.responseText);

//     // split the data into array of lines of type
//     const csvLines = csvData.responseText.toString().split(/\r\n|\n/);
//     data_year = csvLines.map(line => line.split(',')[0])
//     data_conference = csvLines.map(line => line.split(',')[1])
//     data_type = csvLines.map(line => line.split(',')[2])
//     data_title =csvLines.map(line => line.split(',')[3])
//     data_authors =csvLines.map(line => line.split(',')[4])
//     data_doi =csvLines.map(line => line.split(',')[6])
  
//     console.log("Numbers of publications found: "+ data_year.length);
  
//     let publication_container = $("#publication-section").empty()
//     let p_2023 = document.createElement('div');
//     let p_2022 = document.createElement('div');
//     $(p_2023).addClass('row').appendTo($(publication_container));
//     $(p_2022).addClass('row').appendTo($(publication_container));

//     let year_title_2023 = document.createElement('div');
//     $(year_title_2023).addClass('row mb-4').appendTo($(p_2023));
//     $(year_title_2023).html("<strong>2023</strong>")

//     let year_title_2022 = document.createElement('div');
//     $(year_title_2022).addClass('row mb-4').appendTo($(p_2022));
//     $(year_title_2022).html("<strong>2022</strong>")

//     for(var i = 1; i < data_title.length; i++)
//     {
//         let entry_card = document.createElement('div');
//         $(entry_card).addClass('row publication-card-content mb-4');
//         if (data_year[i].indexOf("2022") >= 0) {
//           $(entry_card).appendTo($(p_2022));
//         } else {
//           $(entry_card).appendTo($(p_2023));
//         }

//         $(entry_card).html("<div class='col-4'><a target=_blank' href='"+data_doi[i]+"'><svg xmlns='http://www.w3.org/2000/svg' height='1em' viewBox='0 0 384 512><path d='M320 464c8.8 0 16-7.2 16-16V160H256c-17.7 0-32-14.3-32-32V48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320zM0 64C0 28.7 28.7 0 64 0H229.5c17 0 33.3 6.7 45.3 18.7l90.5 90.5c12 12 18.7 28.3 18.7 45.3V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64z'/></svg></a></div>"+
//           "<div class='col-15'><div class='row publication-title'>@"+data_conference[i]+" -  <a target=_blank' href='"+data_doi[i]+"'>"+data_title[i]+"</a></div>"+
//           "<div class='row'>"+data_authors[i].split(':').join(',')+"</div></div><br><br>")
//     } 
// }

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

    // Use sortedYears for iteration
    for (const year of sortedYears) {
        const yearDiv = $('<div>').addClass('row mb-4').appendTo(publication_container);
        const conferenceContainer = $('<div>').appendTo(yearDiv);  // New container for conferences
    
        for (const conference in groupedPublications[year]) {
            const conferenceDiv = $('<div>').addClass('conference mb-3').appendTo(conferenceContainer);  // Appending to conferenceContainer now
            $('<h4>').text(conference).appendTo(conferenceDiv);
            
            groupedPublications[year][conference].forEach(pub => {
                const entry_card = $('<div>').addClass('publication-card mb-3').appendTo(conferenceDiv);
                
                const linkIcon = "<a target='_blank' href='" + pub.doi + "'><i class='far fa-file'></i></a>";

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
