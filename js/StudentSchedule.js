class StudentSchedule {
    constructor() {
        this.courses = [];
        this.schedule = {};
        for (let day of 'MTWRFSU') {
            this.schedule[day] = {};
            for (let i = 1; i <= 14; i++) {
                this.schedule[day][i] = [];
            }
        }
    }
    clear() {
        this.courses = [];
        this.schedule = {};
        for (let day of 'MTWRFSU') {
            this.schedule[day] = {};
            for (let i = 1; i <= 14; i++) {
                this.schedule[day][i] = [];
            }
        }
    }
    addCourse(course) {
        this.courses.push(course);
        for (let slot of course.getTimeSlots()) {
            let day = slot[0];
            let time = parseInt(slot.slice(1));
            if (this.schedule[day] && this.schedule[day][time]) {
                this.schedule[day][time].push(course.getName());
            } else {
                console.warn(`Invalid time slot: ${slot} for course ${course.getName()}`);
            }
        }
    }

    removeCourse(courseName) {
        const removedCourse = this.courses.find(course => course.getName() === courseName);
        this.courses = this.courses.filter(course => course.getName() !== courseName);
        for (let day in this.schedule) {
            for (let time in this.schedule[day]) {
                this.schedule[day][time] = this.schedule[day][time].filter(name => name !== courseName);
            }
        }
        return removedCourse;
    }

    getSchedule() {
        return this.schedule;
    }

    getCourses() {
        return this.courses;
    }

    getTotalCredits() {
        return this.courses.reduce((total, course) => total + course.getCredits(), 0);
    }
}