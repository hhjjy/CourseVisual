// TODO: 標註學分數量在課程名稱旁邊
// TODO: 列出學分總數 
// TODO: 確保儲存功能可以正確儲存 
// TODO: 匯入匯出功能
document.addEventListener('DOMContentLoaded', function() {
    const timetableDiv = document.getElementById('timetable');
    const availableCourseInput = document.getElementById('availableCourse');
    const availableTimeSlotsInput = document.getElementById('availableTimeSlots');
    const addAvailableCourseButton = document.getElementById('addAvailableCourse');
    const availableCourseListUl = document.getElementById('availableCourseList');
    const plannedCourseListUl = document.getElementById('plannedCourseList');
    const selectedCourseListUl = document.getElementById('selectedCourseList');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    const times = [
        "08:10-09:00", "09:10-10:00", "10:20-11:10", "11:20-12:10",
        "12:20-13:10", "13:20-14:10", "14:20-15:10", "15:30-16:20",
        "16:30-17:20", "17:30-18:20", "18:25-19:15", "19:20-20:10",
        "20:15-21:05", "21:10-22:00"
    ];
    const days = ["節次", "時間", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
    const studentSchedule = new StudentSchedule();
    const courseColors = {};
    const COURSES_STORAGE_KEY = 'courses_data';

    
    let colorIndex = 0;
    const colors = [
        '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA', 
        '#E0BBE4', '#957DAD', '#D291BC', '#FEC8D8', '#FFDFD3',
        '#FF9AA2', '#C7CEEA', '#B5EAD7', '#FF6B6B', '#4ECDC4',
        '#45B7D1', '#EF767A', '#456990', '#49BEAA', '#49DCB1',
        '#EEB868', '#EF476F', '#FFD166', '#06D6A0', '#118AB2',
        '#073B4C', '#F08080', '#E69A8D', '#CBC0D3', '#8FBFE0',
        '#7FD1B9', '#B1D8B7', '#94C9A9', '#76B39D', '#A7D7C5',
        '#F0CF65', '#E0A890', '#D3B5A7', '#AED9E0', '#8FBC94',
        '#C5E99B', '#E3E087', '#F7EF99', '#F1BB87', '#F78E69',
        '#5D5C61', '#379683', '#7395AE', '#557A95', '#B1A296'
    ];

    function saveCourses(courses) {
        console.log('Saving courses:', courses);
        const coursesData = courses.map(course => ({
            code: course.getCode(),
            name: course.getName(),
            timeSlots: course.getTimeSlots(),
            instructor: course.getInstructor(),
            credits: course.getCredits()
        }));
        localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(coursesData));
    }
    function loadCourses() {
        const storedCourses = localStorage.getItem(COURSES_STORAGE_KEY);
        console.log('Loaded stored courses:', storedCourses);
        if (storedCourses) {
            return JSON.parse(storedCourses).map(course => 
                new Course(course.code, course.name, course.timeSlots, course.instructor, course.credits)
            );
        }
        return null;
    }
    function getColorForCourse(courseName) {
        if (!courseColors[courseName]) {
            courseColors[courseName] = colors[colorIndex % colors.length];
            colorIndex++;
        }
        return courseColors[courseName];
    }

    function createTimetable() {
        const table = document.createElement('table');
        const headerRow = table.insertRow();
        
        // 添加表頭
        ['節次', '時間', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'].forEach(day => {
            const th = document.createElement('th');
            th.textContent = day;
            headerRow.appendChild(th);
        });
    
        // 創建時間表行
        times.forEach((time, index) => {
            const row = table.insertRow();
            
            // 節次 - 方法 1：使用 createElement 和 appendChild
            const cellIndex = row.insertCell();
            const span = document.createElement('span');
            span.textContent = String(index + 1);  // 將數字轉換為字串
            cellIndex.appendChild(span);
            
            // 時間 - 方法 2：直接設置 textContent
            const cellTime = row.insertCell();
            cellTime.textContent = time;
            
            // 每天的單元格 - 方法 3：使用 createTextNode
            for (let i = 0; i < 7; i++) {
                const cell = row.insertCell();
                const emptyText = document.createTextNode('');
                cell.appendChild(emptyText);
            }
        });
    
        // 清空並添加新表格
        timetableDiv.innerHTML = '';
        timetableDiv.appendChild(table);
    }

    function updateTimetable() {
        const schedule = studentSchedule.getSchedule();
        const table = timetableDiv.querySelector('table');
        
        // 只清空課程單元格，保留節次和時間
        for (let i = 1; i < table.rows.length; i++) {
            for (let j = 2; j < table.rows[i].cells.length; j++) {
                const cell = table.rows[i].cells[j];
                cell.innerHTML = '';
                cell.style.backgroundColor = '';
            }
        }
    
        for (const [day, slots] of Object.entries(schedule)) {
            for (const [slot, courses] of Object.entries(slots)) {
                const dayIndex = 'MTWRFSU'.indexOf(day) + 2;
                const slotIndex = parseInt(slot);
                const cell = table.rows[slotIndex].cells[dayIndex];
                if (cell && courses.length > 0) {
                    cell.style.backgroundColor = '#f0f0f0';
                    courses.forEach((course) => {
                        const courseElement = document.createElement('div');
                        courseElement.textContent = course;
                        courseElement.style.backgroundColor = getColorForCourse(course);
                        courseElement.style.margin = '2px 0';
                        courseElement.style.padding = '2px';
                        courseElement.style.fontSize = '12px';
                        cell.appendChild(courseElement);
                    });
                }
            }
        }
    }

    function updateCourseList(listElement, courses, action) {
        listElement.innerHTML = '';
        courses.forEach(course => {
            const li = document.createElement('li');
            li.textContent = `${course.getCode()} - ${course.getName()} (${course.getCredits()} credits) (${course.getInstructor()}) ${course.getTimeSlots().join(', ')}`;
            li.style.borderLeft = `5px solid ${getColorForCourse(course.getName())}`;
            const actionButton = document.createElement('button');
            actionButton.textContent = getActionButtonText(action);
            actionButton.onclick = () => performAction(action, course);
            li.appendChild(actionButton);
            listElement.appendChild(li);
        });
    
        // Update total credits
        if (listElement === selectedCourseListUl) {
            updateTotalCredits();
        }
    }
    function updateTotalCredits() {
        const totalCredits = studentSchedule.getTotalCredits();
        const totalCreditsElement = document.getElementById('totalCredits');
        if (totalCreditsElement) {
            totalCreditsElement.textContent = `Total Credits: ${totalCredits}`;
        } else {
            const creditsDiv = document.createElement('div');
            creditsDiv.id = 'totalCredits';
            creditsDiv.textContent = `Total Credits: ${totalCredits}`;
            document.querySelector('.selected-courses').appendChild(creditsDiv);
        }
    }
    function getActionButtonText(action) {
        switch(action) {
            case 'add': return '計劃';
            case 'select': return '選擇';
            case 'return': return '放回';
            default: return '操作';
        }
    }

    function performAction(action, course) {
        switch(action) {
            case 'add':
                addToPlan(course);
                break;
            case 'select':
                addCourse(course);
                break;
            case 'return':
                returnCourse(course);
                break;
        }
    }
    function returnCourse(course) {
        studentSchedule.removeCourse(course.getName());
        updateTimetable();
        updateCourseList(selectedCourseListUl, studentSchedule.getCourses(), 'return');
        const plannedCourses = Array.from(plannedCourseListUl.children).map(li => parseCourseInfo(li.textContent));
        plannedCourses.push(course);
        updateCourseList(plannedCourseListUl, plannedCourses, 'select');
    }

    function parseCourseInfo(courseText) {
        const [codeAndName, ...rest] = courseText.split('(');
        const [code, ...nameParts] = codeAndName.split('-').map(part => part.trim());
        const name = nameParts.join('-').trim();
        const instructorMatch = rest.join('(').match(/\((.*?)\)/);
        const instructor = instructorMatch ? instructorMatch[1].trim() : 'Unknown';
        const timeSlots = (courseText.match(/([MTWRFSU]\d+)/g) || []).filter(slot => {
            const day = slot[0];
            const time = parseInt(slot.slice(1));
            return 'MTWRFSU'.includes(day) && time >= 1 && time <= 14;
        });
        return new Course(code, name, timeSlots, instructor);
    }

    function addToPlan(course) {
        const plannedCourses = Array.from(plannedCourseListUl.children).map(li => parseCourseInfo(li.textContent));
        plannedCourses.push(course);
        updateCourseList(plannedCourseListUl, plannedCourses, 'select');
        removeCourseFromList(availableCourseListUl, course.getCode());
    }

    function addCourse(course) {
        studentSchedule.addCourse(course);
        updateTimetable();
        updateCourseList(selectedCourseListUl, studentSchedule.getCourses(), 'return');
        removeCourseFromList(plannedCourseListUl, course.getCode());
    }

    function removeCourse(courseName) {
        const removedCourse = studentSchedule.removeCourse(courseName);
        updateTimetable();
        updateCourseList(selectedCourseListUl, studentSchedule.getCourses(), 'remove');
        if (removedCourse) {
            const availableCourses = Array.from(availableCourseListUl.children).map(li => parseCourseInfo(li.textContent));
            availableCourses.push(removedCourse);
            updateCourseList(availableCourseListUl, availableCourses, 'add');
        }
    }
    function removeCourseFromList(listElement, courseCode) {
        const items = listElement.getElementsByTagName('li');
        for (let i = 0; i < items.length; i++) {
            if (items[i].textContent.startsWith(courseCode)) {
                listElement.removeChild(items[i]);
                break;
            }
        }
    }

    addAvailableCourseButton.addEventListener('click', () => {
        const name = availableCourseInput.value.trim();
        const slots = availableTimeSlotsInput.value.split(',').map(slot => slot.trim());
        if (name && slots.length > 0) {
            const newCourse = new Course(`DUMMY${Math.floor(Math.random() * 1000)}`, name, slots, "Dummy Professor");
            updateCourseList(availableCourseListUl, [newCourse], 'add');
            availableCourseInput.value = '';
            availableTimeSlotsInput.value = '';
        } else {
            alert('請輸入課程名稱和時間段！');
        }
    });
    // New function to handle course search

    function searchCourses(query) {
        fetchCourses({ CourseName: query }, true)
            .then(courses => {
                updateCourseList(availableCourseListUl, courses, 'add');
            })
            .catch(error => {
                console.error("Error searching courses:", error);
                updateCourseList(availableCourseListUl, [], 'add');
            });
    }

    function exportSchedule() {
        const courses = studentSchedule.getCourses();
        const scheduleData = {
            courses: courses.map(course => ({
                code: course.getCode(),
                name: course.getName(),
                timeSlots: course.getTimeSlots(),
                instructor: course.getInstructor(),
                credits: course.getCredits()
            })),
            totalCredits: studentSchedule.getTotalCredits()
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scheduleData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "course_schedule.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
    
    function importSchedule(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    console.log('File content:', e.target.result);
                    const scheduleData = JSON.parse(e.target.result);
                    console.log('Parsed schedule data:', scheduleData);
                    
                    // 清空當前的課程表，而不是創建新的 StudentSchedule 實例
                    studentSchedule.courses = [];
                    for (let day in studentSchedule.schedule) {
                        for (let time in studentSchedule.schedule[day]) {
                            studentSchedule.schedule[day][time] = [];
                        }
                    }
                    
                    if (Array.isArray(scheduleData.courses)) {
                        scheduleData.courses.forEach((courseData, index) => {
                            console.log(`Processing course ${index}:`, courseData);
                            try {
                                const course = new Course(
                                    courseData.code,
                                    courseData.name,
                                    courseData.timeSlots,
                                    courseData.instructor,
                                    parseInt(courseData.credits) || 0
                                );
                                console.log('Created course object:', course);
                                studentSchedule.addCourse(course);
                            } catch (courseError) {
                                console.error(`Error creating course ${index}:`, courseError);
                            }
                        });
                        
                        updateTimetable();
                        updateCourseList(selectedCourseListUl, studentSchedule.getCourses(), 'return');
                        updateTotalCredits();
                        
                        // 更新可用課程列表
                        const availableCourses = loadCourses() || [];
                        updateCourseList(availableCourseListUl, availableCourses, 'add');
                        
                        console.log('Schedule imported successfully');
                    } else {
                        throw new Error('Invalid schedule data format');
                    }
                } catch (error) {
                    console.error('Error importing schedule:', error);
                    alert('匯入課程表時出錯。請確保文件格式正確。錯誤詳情：' + error.message);
                }
            };
            reader.readAsText(file);
        }
    }
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            searchCourses(query);
        }
    });
    
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        if (query) {
            searchCourses(query);
        } else {
            // 如果搜索輸入為空，顯示所有可用課程
            fetchCourses().then(courses => {
                updateCourseList(availableCourseListUl, courses, 'add');
            });
        }
    });
    async function fetchCourses(searchParams = {}, forceRefresh = false) {
        console.log('Starting fetchCourses function');
        if (!forceRefresh) {
            const storedCourses = loadCourses();
            if (storedCourses) {
                console.log('Loaded courses from local storage:', storedCourses);
                return storedCourses;
            }
        }
    
        const defaultParams = {
            Semester: "1131",
            CourseNo: "",
            CourseName: "",
            CourseTeacher: "",
            Dimension: "",
            CourseNotes: "",
            ForeignLanguage: 0,
            OnlyGeneral: 0,
            OnleyNTUST: 0,
            OnlyMaster: 0,
            OnlyUnderGraduate: 0,
            OnlyNode: 0,
            Language: "zh"
        };
    
        const params = { ...defaultParams, ...searchParams };
    
        const apiUrl = 'https://querycourse.ntust.edu.tw/querycourse/api/courses';
        // const proxyUrl = '/';  // 本地端開發 用 192.168.192.100:8080 記得要打開 node server.js 
        const proxyUrl = '/';  // 使用相對路徑 透過nginx 轉發到 192.168.192.100:8080
        const fullUrl = `${proxyUrl}${apiUrl}`;
    
    
        console.log('Fetching courses with params:', params);
        console.log('Full URL:', fullUrl);
    
        try {
            console.log('Sending fetch request');
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Origin': window.location.origin
                },
                body: JSON.stringify(params),
            });
    
            console.log('Response received');
            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers));
    
            if (!response.ok) {
                const responseText = await response.text();
                console.error('Response text:', responseText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`);
            }
    
            console.log('Parsing JSON response');
            const data = await response.json();
            console.log('JSON parsed successfully');
            console.log('Full JSON response:', JSON.stringify(data, null, 2));
    
            const courseMap = new Map();
    
            data.forEach(course => {
                const key = course.CourseNo;
                const timeSlots = course.Node ? course.Node.split(',') : [];
    
                if (courseMap.has(key)) {
                    const existingCourse = courseMap.get(key);
                    existingCourse.addTimeSlots(timeSlots);
                } else {
                    courseMap.set(key, new Course(
                        course.CourseNo,
                        course.CourseName,
                        timeSlots,
                        course.CourseTeacher,
                        parseInt(course.CreditPoint) || 0
                    ));
                }
            });
    
            const courses = Array.from(courseMap.values());
            console.log('Merged courses:', courses);
    
            saveCourses(courses);
    
            return courses;
        } catch (error) {
            console.error("Error in fetchCourses:", error);
            console.log('Falling back to mock data');
            return getMockCourses();
        }
    }
    
    function getMockCourses() {
        return [
            new Course("CS101", "計算機科學導論", ["M3", "W3", "F3"], "張教授"),
            new Course("MA201", "高等微積分", ["T2", "R2"], "李教授"),
            new Course("PH301", "量子物理", ["M6", "W6", "F6"], "王教授"),
        ];
    }
    // 初始化
    createTimetable();
    updateTimetable();

    const storedCourses = loadCourses();
    console.log('Loaded courses on init:', storedCourses);  // 添加這行
    if (storedCourses && storedCourses.length > 0) {
        console.log('Using stored courses');  // 添加這行
        updateCourseList(availableCourseListUl, storedCourses, 'add');
    } else {
        console.log('Fetching new courses');  // 添加這行
        fetchCourses().then(courses => {
            if (courses.length > 0) {
                updateCourseList(availableCourseListUl, courses, 'add');
            } else {
                console.warn("No courses fetched, using mock data");
                updateCourseList(availableCourseListUl, getMockCourses(), 'add');
            }
        }).catch(error => {
            console.error("Error initializing courses:", error);
            updateCourseList(availableCourseListUl, getMockCourses(), 'add');
        });
    }   
    
    // Add event listeners for import/export buttons
    document.getElementById('exportButton').addEventListener('click', exportSchedule);
    document.getElementById('importInput').addEventListener('change', importSchedule);

    // // 獲取並顯示課程
    // const courses = fetchCourses();
    // updateCourseList(availableCourseListUl, courses, 'add');
});
