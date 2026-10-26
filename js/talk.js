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

    splitList(value) {
        return (value || '').split(';;').map(x => x.trim()).filter(Boolean);
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
            ? `<a class="text-link" href="${e(row.url)}" target="_blank" rel="noopener noreferrer">${e(row.name)}<span class="sr-only"> (opens in new tab)</span></a>`
            : e(row.name);

        const details = [];
        const day = this.parseDay(row);
        if (day) {
            details.push(`<li><i aria-hidden="true" class="far fa-calendar"></i> ${this.formatDate(day)}</li>`);
        }
        if (start) {
            details.push(`<li><i aria-hidden="true" class="far fa-clock"></i> ${e(row.time)} (New York time)</li>`);
        }
        if (row.format) {
            details.push(`<li><i aria-hidden="true" class="fas fa-users"></i> ${e(row.format)}</li>`);
        }
        if (row.location) {
            const where = building
                ? `${e(row.location)}, <a class="text-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(building.address)}" target="_blank" rel="noopener noreferrer">${e(building.name)}<span class="sr-only"> (opens map in new tab)</span></a>`
                : e(row.location);
            details.push(`<li><i aria-hidden="true" class="fas fa-map-marker-alt"></i> ${where}</li>`);
        }
        if (row.zoom) {
            details.push(`<li><i aria-hidden="true" class="fas fa-video"></i> <a class="text-link" href="${e(row.zoom)}" target="_blank" rel="noopener noreferrer">Join on Zoom<span class="sr-only"> (opens in new tab)</span></a></li>`);
        }
        if (row.host) {
            details.push(`<li><i aria-hidden="true" class="far fa-user"></i> Hosted by ${e(row.host)}</li>`);
        }

        const calendar = start && end ? `
            <div class="talk-calendar mt-3">
                <a class="btn btn-sm talk-btn" href="${this.googleCalendarUrl(row, start, end)}" target="_blank" rel="noopener noreferrer">Add to Google Calendar<span class="sr-only"> (opens in new tab)</span></a>
                <a class="btn btn-sm talk-btn" href="${this.icsUrl(row, start, end)}" download="${this.talkId(row)}.ics">Download calendar file (.ics)</a>
            </div>` : '';

        const photo = row.photo
            ? `<img class="talk-photo mb-3" src="${CONFIG.paths.headshots}${e(row.photo)}" alt="${e(row.name)}">`
            : '';

        // Optional photos from the session: "file.jpg|Alt text|Caption ;; ..." in media/seminars/
        const photos = this.splitList(row.gallery).map(item => {
            const [file, alt, caption] = item.split('|').map(x => (x || '').trim());
            return `<figure class="talk-gallery-item"><button type="button" class="talk-gallery-open" aria-haspopup="dialog" aria-label="Enlarge photo: ${e(alt)}" data-src="media/seminars/${e(file)}" data-alt="${e(alt)}" data-caption="${e(caption || '')}"><img src="media/seminars/${e(file)}" alt="" loading="lazy"></button>${caption ? `<figcaption>${e(caption)}</figcaption>` : ''}</figure>`;
        });

        // Optional multi-talk sessions: "Name|URL|Title|Summary ;; ..."
        // When there is one photo per talk, each photo sits beside its talk.
        const talkItems = this.splitList(row.talks);
        const paired = talkItems.length > 0 && photos.length === talkItems.length;
        const talks = talkItems.map((item, i) => {
            const [name, url, title, summary] = item.split('|').map(x => (x || '').trim());
            const who = url
                ? `<a class="text-link" href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(name)}<span class="sr-only"> (opens in new tab)</span></a>`
                : e(name);
            const text = `<div class="talk-item-text"><h3 class="h5 talk-item-title">${e(title)}</h3><p class="talk-item-speaker">${who}</p>${summary ? `<p>${e(summary)}</p>` : ''}</div>`;
            return `<li class="talk-item${paired ? ' talk-item-paired' : ''}">${text}${paired ? photos[i] : ''}</li>`;
        });
        const talksSection = talks.length
            ? `<h2 class="h4 mt-4">Talks</h2><ul class="list-unstyled talk-list">${talks.join('')}</ul>` : '';

        const viewer = photos.length ? `
               <dialog class="photo-viewer" aria-label="Photo viewer">
                 <button type="button" class="photo-viewer-close">Close <span aria-hidden="true">&times;</span></button>
                 <figure class="photo-viewer-figure">
                   <img class="photo-viewer-img" src="" alt="">
                   <figcaption class="photo-viewer-caption"></figcaption>
                 </figure>
                 <div class="photo-viewer-nav">
                   <button type="button" class="photo-viewer-prev"><span aria-hidden="true">&larr;</span> Previous photo</button>
                   <span class="photo-viewer-count" aria-live="polite"></span>
                   <button type="button" class="photo-viewer-next">Next photo <span aria-hidden="true">&rarr;</span></button>
                 </div>
               </dialog>` : '';
        const gallerySection = (photos.length && !paired
            ? `<h2 class="h4 mt-4">Photos</h2><div class="talk-gallery">${photos.join('')}</div>` : '') + viewer;

        // Upcoming single-speaker talks show placeholders until the speaker sends details
        const upcoming = day && new Date(day.year, day.month - 1, day.day, 23, 59) >= new Date();
        const pending = upcoming && !talks.length;
        const section = (heading, text) => text
            ? `<h2 class="h4 mt-4">${heading}</h2>${text.split(/\n\s*\n/).map(p => `<p>${e(p)}</p>`).join('')}`
            : (pending ? `<h2 class="h4 mt-4">${heading}</h2><p class="talk-pending">To be announced</p>` : '');

        $('#talk').html(`
            <p class="talk-back"><a class="text-link" href="/#seminar">&larr; All seminars</a></p>
            <p class="talk-kicker">${e(Utils.formatSemesterName(row.semester))} HCI Seminar</p>
            <h1 class="h2 talk-title">${e(row.title || (talks.length ? row.name : 'Title to be announced'))}</h1>
            <div class="row mt-3">
                <div class="${photo ? 'col-md-8' : 'col-12'} talk-body${paired ? ' talk-body-wide' : ''}">
                    ${!row.title && talks.length
                        ? (row.affiliation ? `<p class="talk-speaker">${e(row.affiliation)}</p>` : '')
                        : `<p class="talk-speaker">${row.name ? `${speaker}${row.affiliation ? `, ${e(row.affiliation)}` : ''}` : 'Speaker to be announced'}</p>`}
                    ${photo ? `<div class="talk-photo-mobile d-md-none">${photo}</div>` : ''}
                    <ul class="list-unstyled talk-details">${details.join('')}</ul>
                    ${calendar}
                    ${talksSection}
                    ${section('Abstract', row.abstract)}
                    ${section('Bio', row.bio)}
                    ${gallerySection}
                </div>
                ${photo ? `<div class="col-md-4 d-none d-md-block">${photo}</div>` : ''}
            </div>
        `);
    },

    /**
     * Click-to-enlarge photo viewer on a native modal <dialog>: the browser
     * traps focus, closes on Escape, and returns focus to the opening button.
     * Clicking the dimmed area outside the photo also closes it.
     */
    bindPhotoViewer() {
        const dialog = document.querySelector('.photo-viewer');
        if (!dialog || typeof dialog.showModal !== 'function') return;
        const buttons = [...document.querySelectorAll('.talk-gallery-open')];
        const img = dialog.querySelector('.photo-viewer-img');
        const caption = dialog.querySelector('.photo-viewer-caption');
        const count = dialog.querySelector('.photo-viewer-count');
        const nav = dialog.querySelector('.photo-viewer-nav');
        let index = 0;

        const show = (i) => {
            index = (i + buttons.length) % buttons.length;
            const b = buttons[index].dataset;
            img.src = b.src;
            img.alt = b.alt;
            caption.textContent = b.caption;
            caption.hidden = !b.caption;
            count.textContent = `Photo ${index + 1} of ${buttons.length}`;
        };

        nav.hidden = buttons.length < 2;
        buttons.forEach((button, i) => button.addEventListener('click', () => {
            show(i);
            document.documentElement.classList.add('viewer-open');
            dialog.showModal();
            dialog.querySelector('.photo-viewer-close').focus();
        }));
        dialog.querySelector('.photo-viewer-close').addEventListener('click', () => dialog.close());
        dialog.querySelector('.photo-viewer-prev').addEventListener('click', () => show(index - 1));
        dialog.querySelector('.photo-viewer-next').addEventListener('click', () => show(index + 1));
        dialog.addEventListener('keydown', (event) => {
            if (buttons.length < 2) return;
            if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
            if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
        });
        // A click on the backdrop lands on the <dialog> element itself
        dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
        dialog.addEventListener('close', () => document.documentElement.classList.remove('viewer-open'));
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
                this.bindPhotoViewer();
            },
            error: () => $('#talk').html('<p>Could not load seminar data.</p>')
        });
    }
};

$(document).ready(() => TalkPage.init());
