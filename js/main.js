/**
 * Academic Website Management Script
 * Handles loading and displaying people, publications, alumni, and seminars data
 */

// Configuration object for easier maintenance
const CONFIG = {
    paths: {
        people: 'data/people.csv',
        publications: 'data/publications.csv',
        alumni: 'data/alumni.csv',
        seminars: 'data/seminars.csv',
        headshots: './media/headshots/'
    },
    colors: ['#9B2F7A', '#379DD4', '#61BA84', '#E1B917', '#003865'],
    elements: {
        people: '#people-section',
        labs: '#about-labs',
        alumni: '#alumni-section',
        publications: '#publication-section',
        semesterTabs: '#semesterTabs',
        seminarsContainer: '#seminarsContainer'
    }
};

// Global state
const STATE = {
    seminarsData: {},
    currentSemester: '',
    colors: []
};

/**
 * Utility Functions
 */
const Utils = {
    /**
     * Shuffle array elements randomly
     */
    shuffleArray(array) {
        const shuffled = [...array];
        let currentIndex = shuffled.length, randomIndex;
        
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
        }
        return shuffled;
    },

    /**
     * Parse CSV data synchronously using jQuery
     */
    parseCSVSync(url) {
        try {
            const response = $.ajax({
                type: "GET",
                url: url,
                dataType: "text",
                async: false
            });
            return response.responseText.toString().split(/\r\n|\n/);
        } catch (error) {
            console.error(`Error loading CSV from ${url}:`, error);
            return [];
        }
    },

    /**
     * Create person card HTML
     */
    createPersonCard(person, color, linkIcon = 'link', linkText = 'Personal Website') {
        const iconSvg = linkIcon === 'home' 
            ? '<svg xmlns="http://www.w3.org/2000/svg" height="0.6rem" viewBox="0 0 576 512"><style>svg{fill:#ffffff}</style><path d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z"/></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" height="0.6rem" viewBox="0 0 640 512"><style>svg{fill:#ffffff}</style><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/></svg>';

        const url = person.page_url || person.lab_url;
        const displayName = person.name;
        const linkLabel = person.lab || linkText;

        return `
            <div class="rect-img-container">
                <a href="${url}" target='_blank'>
                    <img src="${CONFIG.paths.headshots}${person.pic_url}" alt="${displayName}" style="height: auto; width: 100%;">
                </a>
            </div>
            <div class="mb-3" style="background-color: ${color}">
                <a href="${url}" target="_blank" style="display: inline-block;">
                    <p style="font-size: 1rem; font-weight: 500 !important; padding: .5rem .5rem 0 .75rem; margin: 0 !important; text-align: left; color: white;">${displayName}</p>
                </a>
                <a class="cryptedmail" href="${url}" target='_blank'>${iconSvg} ${linkLabel}</a>
            </div>
        `;
    },

    /**
     * Show error message in container
     */
    showError(containerId, message) {
        console.error(`Error in ${containerId}:`, message);
        const container = $(containerId);
        if (container.length) {
            container.html(`<div class="error" style="color: red; padding: 10px; border: 1px solid red; margin: 10px 0;">${message}</div>`);
        }
    },

    /**
     * Format semester name for display
     */
    formatSemesterName(semester) {
        const parts = semester.match(/([a-zA-Z]+)(\d+)/);
        if (parts) {
            const season = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
            const year = parts[2];
            return `${season} ${year}`;
        }
        return semester;
    },

    /**
     * Compare semesters like "spring2025"/"fall2024" chronologically.
     * Returns positive if a > b.
     */
    compareSemesters(a, b) {
        const parse = (s) => {
            const match = (s || '').trim().toLowerCase().match(/^(spring|summer|fall|winter)(\d{4})$/);
            if (!match) return { year: -1, seasonOrder: -1 };
            const season = match[1];
            const year = parseInt(match[2], 10);
            const seasonOrderMap = { winter: 0, spring: 1, summer: 2, fall: 3 };
            return { year, seasonOrder: seasonOrderMap[season] ?? -1 };
        };

        const pa = parse(a);
        const pb = parse(b);
        if (pa.year !== pb.year) return pa.year - pb.year;
        return pa.seasonOrder - pb.seasonOrder;
    }
};

/**
 * Data Loading Modules
 */
const DataLoaders = {
    /**
     * Load people data from CSV
     */
    loadPeople() {
        console.log("Loading people data...");
        
        try {
            const csvLines = Utils.parseCSVSync(CONFIG.paths.people);
            if (csvLines.length < 2) {
                throw new Error("No data found in people CSV");
            }

            const students = [];
            const labs = [];
            STATE.colors = Utils.shuffleArray(CONFIG.colors);
            let colorIndex = 0;

            // Parse CSV data (skip header row)
            for (let i = 1; i < csvLines.length; i++) {
                const line = csvLines[i].trim();
                if (!line) continue;

                const data = line.split(',');
                if (data.length < 6) continue;

                const person = {
                    role: data[0]?.trim() || '',
                    name: data[1]?.trim() || '',
                    page_url: data[2]?.trim() || '',
                    pic_url: data[3]?.trim() || '',
                    lab: data[4]?.trim() || '',
                    lab_url: data[5]?.trim() || ''
                };

                if (person.role.toLowerCase().includes("phd")) {
                    students.push(person);
                } else {
                    labs.push(person);
                }
            }

            // Sort students by name
            students.sort((a, b) => a.name.localeCompare(b.name));

            // Render people cards
            this.renderPeople(students, labs, colorIndex);
            
        } catch (error) {
            console.error("Error loading people:", error);
            Utils.showError(CONFIG.elements.people, "Failed to load people data");
        }
    },

    /**
     * Render people cards
     */
    renderPeople(students, labs, colorIndex) {
        const peopleContainer = $(CONFIG.elements.people).empty();
        const labsContainer = $(CONFIG.elements.labs).empty();

        // Render student cards
        students.forEach(student => {
            const card = $('<div>').addClass('col-6 col-lg-2 col-sm-4 align-self-center zoom');
            const color = STATE.colors[colorIndex % STATE.colors.length];
            card.html(Utils.createPersonCard(student, color));
            card.appendTo(peopleContainer);
            colorIndex++;
        });

        // Render lab cards
        labs.forEach(lab => {
            const card = $('<div>').addClass('col-6 col-lg-2 col-sm-4 align-self-center zoom');
            const color = STATE.colors[colorIndex % STATE.colors.length];
            card.html(Utils.createPersonCard(lab, color, 'home', lab.lab));
            card.appendTo(labsContainer);
            colorIndex++;
        });
    },

    /**
     * Load alumni data from CSV
     */
    loadAlumni() {
        console.log("Loading alumni data...");
        
        try {
            const csvLines = Utils.parseCSVSync(CONFIG.paths.alumni);
            const alumni = [];

            for (let i = 1; i < csvLines.length; i++) {
                const line = csvLines[i].trim();
                if (!line) continue;

                const data = line.split(',');
                if (data.length < 4) continue;

                alumni.push({
                    title: data[0]?.trim() || '',
                    name: data[1]?.trim() || '',
                    page: data[2]?.trim() || '',
                    year: data[3]?.trim() || ''
                });
            }

            // Sort by year (most recent first)
            alumni.sort((a, b) => parseInt(b.year) - parseInt(a.year));

            this.renderAlumni(alumni);
            
        } catch (error) {
            console.error("Error loading alumni:", error);
            Utils.showError(CONFIG.elements.alumni, "Failed to load alumni data");
        }
    },

    /**
     * Render alumni list
     */
    renderAlumni(alumni) {
        const container = $(CONFIG.elements.alumni).empty();

        alumni.forEach(alumn => {
            const card = $('<div>');
            const content = alumn.page
                ? `<a href="${alumn.page}" target='_blank'><p style="font-size: 0.85rem; font-weight: 300 !important; padding: .2rem .3rem; margin: 0 !important; text-align: left;"><u>${alumn.name}</u> (${alumn.year} - ${alumn.title})</p></a>`
                : `<p style="font-size: 0.85rem; font-weight: 300 !important; padding: .2rem .3rem; margin: 0 !important; text-align: left; color: black;">${alumn.name} (${alumn.year} - ${alumn.title})</p>`;
            
            card.html(content).appendTo(container);
        });
    },

    /**
     * Load publications data from CSV
     */
    loadPublications() {
        console.log("Loading publications data...");
        
        try {
            const csvLines = Utils.parseCSVSync(CONFIG.paths.publications);
            const publications = [];
            
            for (let i = 0; i < csvLines.length; i++) {
                const line = csvLines[i].trim();
                if (!line) continue;
                
                // Skip header row
                if (i === 0 && line.toLowerCase().includes('year')) {
                    continue;
                }
                
                const tokens = line.split(',');
                if (tokens.length < 5) continue;
                
                const year = tokens[0]?.trim();
                const conference = tokens[1]?.trim();
                const title = tokens[3]?.trim();
                const authors = tokens[4]?.trim();
                
                if (!year || !conference || !title || !authors) continue;
                
                // Find DOI/URL (last token that looks like a URL)
                let doi = '';
                for (let j = tokens.length - 1; j >= 0; j--) {
                    const token = tokens[j]?.trim();
                    if (token && token.startsWith('http')) {
                        doi = token;
                        break;
                    }
                }
                
                if (!doi) continue;
                
                publications.push({ year, conference, title, authors, doi });
            }
            
            if (publications.length === 0) {
                throw new Error("No valid publications found");
            }
            
            this.renderPublications(publications);
            
        } catch (error) {
            console.error("Error loading publications:", error);
            Utils.showError(CONFIG.elements.publications, "Failed to load publications data");
        }
    },

/**
 * Render publications by year and conference
 */
renderPublications(publications) {
    const groupedPublications = this.groupByYearAndConference(publications);
    const container = $(CONFIG.elements.publications).empty();
    const sortedYears = Object.keys(groupedPublications).sort((a, b) => b - a);
    const currentYear = new Date().getFullYear();

    sortedYears.forEach(year => {
        const publicationCount = Object.values(groupedPublications[year])
            .reduce((sum, confPubs) => sum + confPubs.length, 0);
        
        const yearDiv = $('<div>').addClass('year-section').css('width', '100%');
        const yearHeader = $(`<div class="year-header" style="cursor: pointer; margin-bottom: 10px; font-weight: bold;">
            <span class="arrow">&#9654;</span> ${year} (${publicationCount})
        </div>`);
        
        const yearContent = $('<div>').addClass('year-content');

        // Show current year by default
        if (parseInt(year) === currentYear) {
            yearContent.show();
            yearHeader.find('.arrow').html('&#9660;');
        } else {
            yearContent.hide();
        }

        yearHeader.on('click', () => this.toggleYearContent(yearContent, yearHeader.find('.arrow')));

        yearDiv.append(yearHeader).append(yearContent).appendTo(container);

        // Add conferences and publications
        const conferenceContainer = $('<div>').appendTo(yearContent);
        Object.entries(groupedPublications[year]).forEach(([conference, pubs]) => {
            const conferenceDiv = $('<div>').addClass('conference mb-3');
            $('<h4>').text(conference).appendTo(conferenceDiv);

            pubs.forEach(pub => {
                const entryCard = $('<a>').addClass('publication-card')
                    .attr('href', pub.doi)
                    .attr('target', '_blank')
                
                const linkIcon = `<i class='far fa-file'></i>`;
                const pubTitle = `<div class='pub-title'>${pub.title}</div>`;
                const authors = pub.authors.split(':').join(',');
                
                $('<div>').addClass('icon').html(linkIcon).appendTo(entryCard);
                $('<div>').addClass('details').html(`${pubTitle}${authors}`).appendTo(entryCard);
                
                entryCard.appendTo(conferenceDiv);
            });

            conferenceDiv.appendTo(conferenceContainer);
        });
    });
},

    /**
     * Group publications by year and conference
     */
    groupByYearAndConference(publications) {
        return publications.reduce((acc, pub) => {
            if (!acc[pub.year]) acc[pub.year] = {};
            if (!acc[pub.year][pub.conference]) acc[pub.year][pub.conference] = [];
            acc[pub.year][pub.conference].push(pub);
            return acc;
        }, {});
    },

    /**
     * Toggle year content visibility
     */
    toggleYearContent(yearContent, arrowElement) {
        if (yearContent.is(':visible')) {
            yearContent.slideUp();
            arrowElement.html('&#9654;');
        } else {
            yearContent.slideDown();
            arrowElement.html('&#9660;');
        }
    },

    /**
     * Load seminars data using Papa Parse
     */
    loadSeminars() {
        console.log("Loading seminars data...");
        
        Papa.parse(CONFIG.paths.seminars, {
            download: true,
            header: true,
            skipEmptyLines: true,
            dynamicTyping: false,
            complete: (results) => {
                console.log("CSV parsing complete");
                
                if (results.errors.length > 0) {
                    console.error('CSV parsing errors:', results.errors);
                    Utils.showError(CONFIG.elements.seminarsContainer, 'Error parsing CSV file');
                    return;
                }
                
                if (!results.data || results.data.length === 0) {
                    Utils.showError(CONFIG.elements.seminarsContainer, 'No data found in CSV file');
                    return;
                }
                
                this.processSeminarsData(results.data);
                this.renderSemesterTabs();
                // Default to Spring 2025 if present, otherwise pick the most recent semester.
                this.setSemester(this.getDefaultSemester());
            },
            error: (error) => {
                console.error('Error loading CSV:', error);
                Utils.showError(CONFIG.elements.seminarsContainer, 'Error loading seminar data');
            }
        });
    },

    /**
     * Return the default semester to show on load.
     */
    getDefaultSemester() {
        const semesters = Object.keys(STATE.seminarsData);
        if (semesters.includes('spring2026')) return 'spring2026';
        if (semesters.includes('spring2025')) return 'spring2025';
        if (semesters.length === 0) return '';

        // Most recent semester by chronological compare
        return semesters.sort(Utils.compareSemesters).at(-1);
    },

    /**
     * Process and organize seminar data
     */
    processSeminarsData(data) {
        STATE.seminarsData = {};
        
        data.forEach((row, index) => {
            // Trim whitespace
            Object.keys(row).forEach(key => {
                if (typeof row[key] === 'string') {
                    row[key] = row[key].trim();
                }
            });
            
            const semester = row.semester;
            if (!semester) return;
            
            if (!STATE.seminarsData[semester]) {
                STATE.seminarsData[semester] = [];
            }
            
            STATE.seminarsData[semester].push({
                date: row.date || '',
                name: row.name || '',
                url: row.url || '',
                title: row.title || '',
                description: row.description || ''
            });
        });
        
        // Sort by date within each semester
        Object.keys(STATE.seminarsData).forEach(semester => {
            STATE.seminarsData[semester].sort((a, b) => {
                if (a.date && b.date) {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    if (!isNaN(dateA) && !isNaN(dateB)) {
                        return dateA - dateB;
                    }
                }
                return 0;
            });
        });
    },

    /**
     * Render semester tabs
     */
    renderSemesterTabs() {
        const tabs = $(CONFIG.elements.semesterTabs);
        if (!tabs.length) {
            console.error('Semester tabs container not found');
            return;
        }

        tabs.empty();

        const semesters = Object.keys(STATE.seminarsData);
        if (semesters.length === 0) {
            Utils.showError(CONFIG.elements.seminarsContainer, 'No seminar data found');
            return;
        }

        // Sort semesters oldest -> newest, then display newest -> oldest (left to right)
        const sorted = semesters.sort(Utils.compareSemesters).reverse();

        sorted.forEach((semester) => {
            const label = Utils.formatSemesterName(semester);
            const btn = $('<button>')
                .addClass('semester-tab')
                .attr('type', 'button')
                .attr('role', 'tab')
                .attr('data-semester', semester)
                .attr('aria-selected', 'false')
                .text(label)
                .on('click', () => this.setSemester(semester));

            tabs.append(btn);
        });
    },

    /**
     * Set current semester and update UI
     */
    setSemester(semester) {
        if (!semester) return;
        STATE.currentSemester = semester;

        // Update active tab styles + aria
        const tabs = $(CONFIG.elements.semesterTabs);
        tabs.find('.semester-tab').each(function () {
            const $btn = $(this);
            const isActive = $btn.data('semester') === semester;
            $btn.toggleClass('active', isActive);
            $btn.attr('aria-selected', isActive ? 'true' : 'false');
        });

        this.showSemester(semester);
    },

    /**
     * Display selected semester's seminars
     */
    showSemester(semesterOverride) {
        const container = $(CONFIG.elements.seminarsContainer);
        
        if (!container.length) {
            console.error('Required seminar elements not found');
            return;
        }
        
        const selectedSemester = semesterOverride || STATE.currentSemester;
        if (!selectedSemester) {
            Utils.showError(CONFIG.elements.seminarsContainer, 'No semester selected');
            return;
        }
        
        // Hide hardcoded semester divs if they exist
        $('#fall2024, #spring2025').hide();
        $(`#${selectedSemester}`).show();
        
        if (!STATE.seminarsData[selectedSemester]) {
            Utils.showError(CONFIG.elements.seminarsContainer, 'No data found for selected semester');
            return;
        }
        
        const seminars = STATE.seminarsData[selectedSemester];
        let html = '<ul class="list-unstyled">';
        
        seminars.forEach(seminar => {
            html += '<li>';
            
            if (seminar.url && seminar.name) {
                html += `<a href="${seminar.url}" target="_blank"><b>${seminar.date} - ${seminar.name}</b></a>`;
            } else if (seminar.name) {
                html += `<b>${seminar.date} - ${seminar.name}</b>`;
            } else {
                html += `<b>${seminar.date}</b>`;
            }
            
            if (seminar.title) {
                html += `: "${seminar.title}"`;
            }
            
            if (seminar.description) {
                html += ` - ${seminar.description}`;
            }
            
            html += '</li>';
        });
        
        html += '</ul>';
        container.html(html);
    }
};

/**
 * Event Handlers
 */
const EventHandlers = {
    /**
     * Initialize scroll-based navigation highlighting
     */
    initScrollNavigation() {
        $(window).scroll(function () {
            const distance = $(window).scrollTop();
            $('.section').each(function (i) {
                if ($(this).position().top <= distance + 50) {
                    $('.navbar-nav a').removeClass('active');
                    $('.navbar-nav a').eq(i).addClass('active');
                }
            });
        });
    },

    /**
     * Handle Ctrl+F search by expanding all collapsed sections
     */
    initSearchExpansion() {
        $(window).on('keydown', function (event) {
            if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
                $('.year-content').each(function () {
                    const yearContent = $(this);
                    const arrow = yearContent.siblings('.year-header').find('.arrow');
                    if (!yearContent.is(':visible')) {
                        yearContent.show();
                        arrow.html('&#9660;');
                    }
                });
            }
        });
    },

    // No longer needed: semester selection is handled by tab click events.
};

/**
 * Main Application Initialization
 */
$(document).ready(function () {
    console.log("Initializing academic website...");
    
    // Initialize event handlers
    EventHandlers.initScrollNavigation();
    EventHandlers.initSearchExpansion();
    
    // Load all data
    DataLoaders.loadPeople();
    DataLoaders.loadPublications();
    DataLoaders.loadAlumni();
    DataLoaders.loadSeminars();
    
    console.log("Academic website initialization complete");
});

// Global functions for backward compatibility
window.showSemester = () => DataLoaders.showSemester();