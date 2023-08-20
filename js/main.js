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
  
function load_people() {
    // load people data
    csvData = $.ajax({
      type: "GET",
      url: "data/people.csv",
      dataType: "text/csv",
      async: false
    });
  
    console.log("CSV data: "+ csvData.responseText);
  
    // split the data into array of lines of type
    const csvLines = csvData.responseText.toString().split(/\r\n|\n/);
    data_role = csvLines.map(line => line.split(',')[0])
    data_names = csvLines.map(line => line.split(',')[1])
    data_page_url =csvLines.map(line => line.split(',')[2])
    data_pic_url =csvLines.map(line => line.split(',')[3])
    data_lab =csvLines.map(line => line.split(',')[4])
    data_lab_url =csvLines.map(line => line.split(',')[5])
  
    console.log("Numbers of people found: "+data_names.length);
  
    let people_container = $("#people-section").empty()
    let labs_container = $("#about-labs").empty()
    for(var i = 1; i < data_names.length; i++)
      {
        let card = document.createElement('div');
        if (data_role[i].indexOf("phd") >= 0) {
          $(card).addClass('col-md-2 col-sm-4 col-4 people-card').appendTo($(people_container));
          let card_content = document.createElement('div');
          $(card_content).addClass('people-card-content').appendTo($(card));
          $(card_content).html("<a target=_blank' href='"+data_page_url[i]+"'>"+
          "<img src='./media/headshots/"+data_pic_url[i]+"' class='row people-image center-align' /></a>"+
          "<div class='row body-text pt-2 center-align'>Ph.D. Student</div>"+
          "<div class='row people-name center-align'><strong>"+data_names[i]+"</strong></div>")
  
        } else {
          $(card).addClass('lab-card col').appendTo($(labs_container));
          let card_content = document.createElement('div');
          $(card_content).addClass('lab-card-content').appendTo($(card));
          $(card_content).html("<a target=_blank' href='"+data_lab_url[i]+"'><div class='lab-title'>"+data_lab[i]+"</div></a>"+
          "<img src='./media/headshots/"+data_pic_url[i]+"' class='row center-align' />"+
          "<div class='row lab-professor-text pt-2 center-align'>"+data_names[i]+"</div>")
        }
      } 
}

function load_publications() {
    // load publication data
    csvData = $.ajax({
        type: "GET",
        url: "data/publications.csv",
        dataType: "text/csv",
        async: false
    });   

    console.log("CSV data: "+ csvData.responseText);

    // split the data into array of lines of type
    const csvLines = csvData.responseText.toString().split(/\r\n|\n/);
    data_year = csvLines.map(line => line.split(',')[0])
    data_conference = csvLines.map(line => line.split(',')[1])
    data_type = csvLines.map(line => line.split(',')[2])
    data_title =csvLines.map(line => line.split(',')[3])
    data_authors =csvLines.map(line => line.split(',')[4])
    data_doi =csvLines.map(line => line.split(',')[6])
  
    console.log("Numbers of publications found: "+ data_year.length);
  
    let publication_container = $("#publication-section").empty()
    let p_2023 = document.createElement('div');
    let p_2022 = document.createElement('div');
    $(p_2023).addClass('row').appendTo($(publication_container));
    $(p_2022).addClass('row').appendTo($(publication_container));

    let year_title_2023 = document.createElement('div');
    $(year_title_2023).addClass('row mb-4').appendTo($(p_2023));
    $(year_title_2023).html("<strong>2023</strong>")

    let year_title_2022 = document.createElement('div');
    $(year_title_2022).addClass('row mb-4').appendTo($(p_2022));
    $(year_title_2022).html("<strong>2022</strong>")
    for(var i = 1; i < data_names.length; i++)
    {
        let entry_card = document.createElement('div');
        $(entry_card).addClass('row publication-card-content mb-4');
        if (data_year[i].indexOf("2022") >= 0) {
          $(entry_card).appendTo($(p_2022));
        } else {
          $(entry_card).appendTo($(p_2023));
        }

        $(entry_card).html("<div class='col-1'><a target=_blank' href='"+data_doi[i]+"'>[link]</a></div>"+
          "<div class='col-11'><div class='row publication-title'>@"+data_conference[i]+" - "+data_title[i]+"</div>"+
          "<div class='row'>"+data_authors[i].split(':').join(',')+"</div></div>")
    } 
}
