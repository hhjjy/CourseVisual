class Course {
    constructor(code, name, timeSlots, instructor, credits) {
        this.code = code;
        this.name = name;
        this.timeSlots = this.validateTimeSlots(timeSlots);
        this.instructor = instructor;
        this.credits = this.validateCredits(credits);
    }

    validateTimeSlots(timeSlots) {
        return Array.isArray(timeSlots) ? timeSlots.filter(slot => {
            const day = slot[0];
            const time = parseInt(slot.slice(1));
            return 'MTWRFSU'.includes(day) && time >= 1 && time <= 14;
        }) : [];
    }

    validateCredits(credits) {
        const parsedCredits = parseInt(credits);
        return isNaN(parsedCredits) ? 0 : parsedCredits;
    }

    addTimeSlots(newSlots) {
        const validNewSlots = this.validateTimeSlots(newSlots);
        this.timeSlots = [...new Set([...this.timeSlots, ...validNewSlots])];
    }

    getCode() {
        return this.code;
    }

    getName() {
        return this.name;
    }

    getTimeSlots() {
        return this.timeSlots;
    }

    getInstructor() {
        return this.instructor;
    }

    getCredits() {
        return this.credits;
    }
}