/**
 * Talk detail page (talk.html?id=fall2026-11-16)
 * Reads the same data/seminars.csv as the main page; one row = one talk.
 */

const TalkPage = {
    TIMEZONE: 'America/New_York',
    // Building address for map links, keyed by the room prefix used in the CSV.
    BUILDINGS: {
        CSB: { name: 'Computer Science Building', address: '1214 Amsterdam Ave, New York, NY 10027' }
    },

    talkId(row) {
        return `${row.semester}-${(row.date || '').replace('/', '-')}`;
    },

    escape(text) {
        return $('<div>').text(text || '').html();
    },

    /** Year from the semester ("fall2026") plus month/day from "MM/DD". */
    parseDay(row) {
        const year = parseInt((row.semester.match(/\d{4}/) || [])[0], 10);
        const [month, day] = (row.date || '').split('/').map(n => parseInt(n, 10));
        return year && month && day ? { year, month, day } : null;
    },

    /** Build a Date in local wall-clock terms from semester year + "MM/DD" + "1:00 PM". */
    parseTime(row, which) {
        const year = parseInt((row.semester.match(/\d{4}/) || [])[0], 10);
        const [month, day] = row.date.split('/').map(n => parseInt(n, 10));
        const range = (row.time || '').split('-').map(s => s.trim());
        // "1:00-2:00 PM": the start inherits the end's AM/PM when it has none
        const meridiem = (range[1] || '').match(/AM|PM/i);
        const part = which === 'start' ? range[0] : range[1];
        const match = (part || '').match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (!year || !month || !day || !match) return null;
        let hour = parseInt(match[1], 10) % 12;
        const ampm = (match[3] || (meridiem && meridiem[0]) || 'PM').toUpperCase();
        if (ampm === 'PM') hour += 12;
        return { year, month, day, hour, minute: parseInt(match[2], 10) };
    },

    stamp(t) {
        const pad = n => String(n).padStart(2, '0');
        return `${t.year}${pad(t.month)}${pad(t.day)}T${pad(t.hour)}${pad(t.minute)}00`;
    },

    calendarText(row) {
        const title = row.title ? `${row.name}: ${row.title}` : `${row.name}`;
        return { summary: `Columbia HCI Seminar: ${title}`, details: `${location.href}` };
    },

    googleCalendarUrl(row, start, end) {
        const { summary, details } = this.calendarText(row);
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: summary,
            dates: `${this.stamp(start)}/${this.stamp(end)}`,
            ctz: this.TIMEZONE,
            location: this.locationText(row),
            details
        });
        return `https://calendar.google.com/calendar/render?${params}`;
    },

    icsUrl(row, start, end) {
        const { summary, details } = this.calendarText(row);
        const clean = s => (s || '').replace(/[,;\\]/g, m => `\\${m}`).replace(/\n/g, '\\n');
        const ics = [
            'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Columbia HCI//Seminar//EN', 'BEGIN:VEVENT',
            `UID:${this.talkId(row)}@columbiahci.github.io`,
            `DTSTART;TZID=${this.TIMEZONE}:${this.stamp(start)}`,
            `DTEND;TZID=${this.TIMEZONE}:${this.stamp(end)}`,
            `SUMMARY:${clean(summary)}`,
            `LOCATION:${clean(this.locationText(row))}`,
            `DESCRIPTION:${clean(details)}`,
            'END:VEVENT', 'END:VCALENDAR'
        ].join('\r\n');
        return URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    },

    building(row) {
        const prefix = (row.location || '').trim().split(/\s+/)[0];
        return this.BUILDINGS[prefix];
    },

    locationText(row) {
        const building = this.building(row);
        return building ? `${row.location}, ${building.name}, ${building.address}` : (row.location || '');
    },

    formatDate(t) {
        return new Date(t.year, t.month - 1, t.day).toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        });
    },

    render(row) {
        const e = s => this.escape(s);
        const start = this.parseTime(row, 'start');
        const end = this.parseTime(row, 'end');
        const building = this.building(row);
        document.title = `${row.name} | HCI Seminar@Columbia`;

        const speaker = row.url
            ? `<a class="text-link" href="${e(row.url)}" target="_blank" rel="noopener noreferrer">${e(row.name)}</a>`
            : e(row.name);

        const details = [];
        const day = this.parseDay(row);
        if (day) {
            details.push(`<li><i class="far fa-calendar"></i> ${this.formatDate(day)}</li>`);
        }
        if (start) {
            details.push(`<li><i class="far fa-clock"></i> ${e(row.time)} (New York time)</li>`);
        }
        if (row.location) {
            const where = building
                ? `${e(row.location)}, <a class="text-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(building.address)}" target="_blank" rel="noopener noreferrer">${e(building.name)}</a>`
                : e(row.location);
            details.push(`<li><i class="fas fa-map-marker-alt"></i> ${where}</li>`);
        }
        if (row.zoom) {
            details.push(`<li><i class="fas fa-video"></i> <a class="text-link" href="${e(row.zoom)}" target="_blank" rel="noopener noreferrer">Join on Zoom</a></li>`);
        }
        if (row.host) {
            details.push(`<li><i class="far fa-user"></i> Hosted by ${e(row.host)}</li>`);
        }

        const calendar = start && end ? `
            <div class="talk-calendar mt-3">
                <a class="btn btn-sm talk-btn" href="${this.googleCalendarUrl(row, start, end)}" target="_blank" rel="noopener noreferrer">Add to Google Calendar</a>
                <a class="btn btn-sm talk-btn" href="${this.icsUrl(row, start, end)}" download="${this.talkId(row)}.ics">Download .ics</a>
            </div>` : '';

        const photo = row.photo
            ? `<img class="talk-photo mb-3" src="${CONFIG.paths.headshots}${e(row.photo)}" alt="${e(row.name)}">`
            : '';

        const section = (heading, text) => text
            ? `<h2 class="h4 mt-4">${heading}</h2>${text.split(/\n\s*\n/).map(p => `<p>${e(p)}</p>`).join('')}`
            : '';

        $('#talk').html(`
            <p class="talk-kicker">${e(Utils.formatSemesterName(row.semester))} HCI Seminar</p>
            <h1 class="h2 talk-title">${e(row.title || 'Title to be announced')}</h1>
            <div class="row mt-4">
                <div class="col-md-8">
                    <p class="talk-speaker">${speaker}${row.affiliation ? `, ${e(row.affiliation)}` : ''}</p>
                    <ul class="list-unstyled talk-details">${details.join('')}</ul>
                    ${calendar}
                    ${section('Abstract', row.abstract)}
                    ${section('Bio', row.bio)}
                </div>
                <div class="col-md-4">${photo}</div>
            </div>
            <p class="mt-5"><a class="text-link" href="/#seminar">&larr; All seminars</a></p>
        `);
    },

    init() {
        const id = new URLSearchParams(location.search).get('id');
        Papa.parse(CONFIG.paths.seminars, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const row = results.data.find(r => r.semester && this.talkId(r) === id);
                if (!row) {
                    $('#talk').html('<p>Talk not found. <a href="/#seminar">See all seminars</a>.</p>');
                    return;
                }
                this.render(row);
            },
            error: () => $('#talk').html('<p>Could not load seminar data.</p>')
        });
    }
};

$(document).ready(() => TalkPage.init());
