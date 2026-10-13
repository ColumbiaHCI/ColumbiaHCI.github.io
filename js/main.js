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
    colors: ['#952D75', '#1B5C80', '#2A6140', '#E1B917', '#003865'],
    elements: {
        people: '#people-section',
        msStudents: '#ms-students-section',
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
    currentPublicationYear: '',
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

        const hasLabLink = Boolean(person.lab_url && person.lab);

        // Faculty: show only the lab name link (as requested)
        const linksHtml = linkIcon === 'home'
            ? `
                ${hasLabLink ? `<a class="person-link" href="${person.lab_url}" target="_blank" rel="noopener noreferrer">${iconSvg} ${person.lab}<span class="sr-only"> (opens in new tab)</span></a>` : ''}
              `
            : `
                <a class="person-link" href="${url}" target="_blank" rel="noopener noreferrer">${iconSvg} ${linkLabel}<span class="sr-only"> (opens in new tab)</span></a>
              `;

        return `
            <div class="rect-img-container">
                <a href="${url}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">
                    <img src="${CONFIG.paths.headshots}${person.pic_url}" alt="${displayName.replace(/"/g, '&quot;')}">
                </a>
            </div>
            <div class="person-card-footer${Utils.isLightColor(color) ? ' card-light' : ''}" style="background-color: ${color}">
                <div class="person-name-row">
                    <a href="${url}" target="_blank" rel="noopener noreferrer" class="person-name-link">${displayName}<span class="sr-only"> (opens in new tab)</span></a>
                </div>
                <div class="person-links-row">
                    ${linksHtml}
                </div>
            </div>
        `;
    },

    /**
     * Complete the ARIA tab pattern for a tablist of buttons: ids,
     * aria-controls, roving tabindex, and a labelled tabpanel.
     * Keyboard handling is attached once per tablist.
     */
    syncTabs(tablistSelector, panelSelector) {
        const tablist = $(tablistSelector);
        const panel = $(panelSelector);
        const panelId = panel.attr('id');
        const tabs = tablist.find('[role="tab"]');
        tabs.each(function () {
            const $tab = $(this);
            const key = $tab.data('semester') || $tab.data('year');
            const selected = $tab.attr('aria-selected') === 'true';
            $tab.attr({ id: `${panelId}-tab-${key}`, 'aria-controls': panelId, tabindex: selected ? '0' : '-1' });
            if (selected) panel.attr('aria-labelledby', $tab.attr('id'));
        });
        panel.attr({ role: 'tabpanel', tabindex: '0' });

        if (tablist.data('keysBound')) return;
        tablist.data('keysBound', true);
        tablist.on('keydown', '[role="tab"]', (event) => {
            const all = tablist.find('[role="tab"]').toArray();
            const index = all.indexOf(event.currentTarget);
            const targets = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: all.length - 1 };
            if (!(event.key in targets)) return;
            event.preventDefault();
            const next = all[(targets[event.key] + all.length) % all.length];
            next.focus();
            next.click();
        });
    },

    /**
     * True when a background is light enough that white text would be unreadable
     */
    isLightColor(hex) {
        const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
            .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
        const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
        return luminance > 0.18;
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
            const msStudents = [];
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
                } else if (person.role.toLowerCase().startsWith("ms")) {
                    msStudents.push(person);
                } else {
                    labs.push(person);
                }
            }

            // Sort students by name
            students.sort((a, b) => a.name.localeCompare(b.name));
            msStudents.sort((a, b) => a.name.localeCompare(b.name));

            // Render people cards
            this.renderPeople(students, msStudents, labs, colorIndex);
            
        } catch (error) {
            console.error("Error loading people:", error);
            Utils.showError(CONFIG.elements.people, "Failed to load people data");
        }
    },

    /**
     * Render people cards
     */
    renderPeople(students, msStudents, labs, colorIndex) {
        const peopleContainer = $(CONFIG.elements.people).empty();
        const msStudentsContainer = $(CONFIG.elements.msStudents).empty();
        const labsContainer = $(CONFIG.elements.labs).empty();

        // Render student cards
        students.forEach(student => {
            const card = $('<div>').addClass('col-6 col-lg-2 col-sm-4 person-card zoom mb-4');
            const color = STATE.colors[colorIndex % STATE.colors.length];
            card.html(Utils.createPersonCard(student, color));
            card.appendTo(peopleContainer);
            colorIndex++;
        });

        // Render M.S. student cards
        msStudents.forEach(student => {
            const card = $('<div>').addClass('col-6 col-lg-2 col-sm-4 person-card zoom mb-4');
            const color = STATE.colors[colorIndex % STATE.colors.length];
            card.html(Utils.createPersonCard(student, color));
            card.appendTo(msStudentsContainer);
            colorIndex++;
        });

        // Render lab cards
        labs.forEach(lab => {
            const card = $('<div>').addClass('col-6 col-lg-2 col-sm-4 person-card zoom mb-4');
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
        const NEW_TAB = '<span class="sr-only"> (opens in new tab)</span>';
        // alumni.csv uses mixed labels ("Ph.D.", "ms student", "ugrad"); group them consistently
        const groups = [
            { label: 'Ph.D.', match: t => /ph\.?d/i.test(t) },
            { label: 'M.S.', match: t => /^ms|master/i.test(t) },
            { label: 'Undergraduate', match: t => /ugrad|undergrad|b\.?[as]/i.test(t) }
        ];

        const wrapper = $('<div>').addClass('alumni-groups');
        groups.forEach(group => {
            const members = alumni
                .filter(a => group.match(a.title || ''))
                .sort((a, b) => (parseInt(b.year) - parseInt(a.year)) || a.name.localeCompare(b.name));
            if (!members.length) return;

            const items = members.map(a => {
                const name = a.page
                    ? `<a href="${a.page}" target="_blank" rel="noopener noreferrer" class="text-link">${a.name}${NEW_TAB}</a>`
                    : a.name;
                return `<li>${name}<span class="alumni-year">, ${a.year}</span></li>`;
            }).join('');

            wrapper.append(`
                <section class="alumni-group" aria-labelledby="alumni-${group.label.replace(/\W/g, '')}">
                    <h3 class="alumni-heading" id="alumni-${group.label.replace(/\W/g, '')}">${group.label}</h3>
                    <ul class="alumni-list">${items}</ul>
                </section>`);
        });
        container.append(wrapper);
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
                
                // Papa handles quoted titles that contain commas
                const tokens = Papa.parse(line).data[0] || [];
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
    const years = Object.keys(groupedPublications).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

    // Build year tabs
    this.renderPublicationYearTabs(years);

    // Default to latest year available
    const defaultYear = years[0] || '';
    this.setPublicationYear(defaultYear, groupedPublications);
},

/**
 * Render publication year tabs (like seminar tabs)
 */
renderPublicationYearTabs(years) {
    const tabs = $('#publicationYearTabs');
    if (!tabs.length) return;

    tabs.empty();

    years.forEach((year) => {
        const btn = $('<button>')
            .addClass('year-tab')
            .attr('type', 'button')
            .attr('role', 'tab')
            .attr('data-year', year)
            .attr('aria-selected', 'false')
            .text(year)
            .on('click', () => {
                const grouped = this._lastGroupedPublications;
                this.setPublicationYear(year, grouped);
            });

        tabs.append(btn);
    });
},

/**
 * Set current publication year and render only that year
 */
setPublicationYear(year, groupedPublications) {
    if (!year || !groupedPublications || !groupedPublications[year]) return;

    // Save for tab click reuse
    this._lastGroupedPublications = groupedPublications;

    STATE.currentPublicationYear = year;

    // Update active tab styles + aria
    const tabs = $('#publicationYearTabs');
    tabs.find('.year-tab').each(function () {
        const $btn = $(this);
        const isActive = String($btn.data('year')) === String(year);
        $btn.toggleClass('active', isActive);
        $btn.attr('aria-selected', isActive ? 'true' : 'false');
    });
    Utils.syncTabs('#publicationYearTabs', '#publication-section');

    // Render selected year only
    const container = $(CONFIG.elements.publications).empty();
    const yearSection = $('<div>').addClass('year-section').css('width', '100%');

    const conferenceContainer = $('<div>').appendTo(yearSection);
    Object.entries(groupedPublications[year]).forEach(([conference, pubs]) => {
        const conferenceDiv = $('<div>').addClass('conference mb-3');
        $('<h3>').addClass('h4').text(conference).appendTo(conferenceDiv);

        pubs.forEach(pub => {
            const entryCard = $('<a>')
                .addClass('publication-card')
                .attr('href', pub.doi)
                .attr('target', '_blank')
                .attr('rel', 'noopener noreferrer');

            const linkIcon = `<i class='far fa-file' aria-hidden='true'></i>`;
            const pubTitle = `<div class='pub-title'>${pub.title}</div>`;
            const authors = pub.authors.split(':').join(',');

            $('<div>').addClass('icon').html(linkIcon).appendTo(entryCard);
            $('<div>').addClass('details').html(`${pubTitle}${authors}<span class="sr-only"> (opens in new tab)</span>`).appendTo(entryCard);

            entryCard.appendTo(conferenceDiv);
        });

        conferenceDiv.appendTo(conferenceContainer);
    });

    yearSection.appendTo(container);
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
                description: row.description || '',
                time: row.time || '',
                location: row.location || '',
                abstract: row.abstract || ''
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
        Utils.syncTabs(CONFIG.elements.semesterTabs, CONFIG.elements.seminarsContainer);

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
            
            const talkUrl = `talk.html?id=${selectedSemester}-${seminar.date.replace('/', '-')}`;
            const speaker = seminar.name
                ? `<span class="seminar-speaker">${seminar.name}</span>`
                : 'Speaker to be announced';
            const title = seminar.title ? `"${seminar.title}"` : 'Title to be announced';
            const description = seminar.description ? ` - ${seminar.description}` : '';

            // One link per talk: the whole line opens its talk page
            html += `<a href="${talkUrl}" class="seminar-row"><b>${seminar.date} - ${speaker}</b>: ${title}${description}</a>`;
            
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
/**
 * Display settings panel: theme (system/light/dark) and text size. Preferences are stored per visitor; the inline <head> script
 * applies them before first paint so pages don't flash.
 */
const DisplayPrefs = {
    root: document.documentElement,

    read(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    },

    write(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* storage blocked */ }
    },

    applyTheme(choice) {
        const dark = choice === 'dark' ||
            (choice === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        this.root.setAttribute('data-theme', dark ? 'dark' : 'light');
    },

    init() {
        const button = $('#displaySettingsButton');
        const panel = $('#displaySettingsPanel');
        if (!button.length) return;

        const theme = this.read('hci-theme') || 'system';
        const text = this.read('hci-text') || '100';
        panel.find(`input[name="hci-theme"][value="${theme}"]`).prop('checked', true);
        panel.find(`input[name="hci-text"][value="${text}"]`).prop('checked', true);

        // Follow the OS setting live while the theme is "System"
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if ((this.read('hci-theme') || 'system') === 'system') this.applyTheme('system');
        });

        panel.on('change', 'input[name="hci-theme"]', (event) => {
            this.write('hci-theme', event.target.value);
            this.applyTheme(event.target.value);
        });
        panel.on('change', 'input[name="hci-text"]', (event) => {
            const value = event.target.value;
            this.write('hci-text', value);
            if (value === '100') this.root.removeAttribute('data-text');
            else this.root.setAttribute('data-text', value);
        });

        // Disclosure: toggle, close on Escape (focus returns) or outside click
        const setOpen = (open) => {
            button.attr('aria-expanded', open ? 'true' : 'false');
            panel.prop('hidden', !open);
        };
        button.on('click', () => setOpen(panel.prop('hidden')));
        $(document).on('keydown', (event) => {
            if (event.key === 'Escape' && !panel.prop('hidden')) {
                setOpen(false);
                button.trigger('focus');
            }
        });
        $(document).on('click', (event) => {
            if (!panel.prop('hidden') && !$(event.target).closest('.display-settings').length) setOpen(false);
        });
    }
};

$(document).ready(function () {
    DisplayPrefs.init();

    // Talk detail pages load this file for CONFIG/Utils only
    if (!document.getElementById('seminar')) return;

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