<script>
    // Example course data
    let courses = [
        {
            url: './courses/robotics',
            code: 'WSUB35',
            award: 'BEng',
            title: 'Robotics, Mechatronics and Control Engineering',
            department: 'Wolfson School of Mechanical, Electrical and Manufacturing Engineering',
            examWeighting: '80%',
            courseworkWeighting: '10%',
            projectWeighting: '10%',
            homeFees: '£9,250',
            internationalFees: '£27,000'
        },
        // Add more course data as needed
    ];
</script>

<div class='py-4 px-1 card mt-4 '>
    <h1 >Courses</h1>
    <div class='flex flex-col gap-1.5'>
        <div class='subcard flex flex-col place-items-start'>
            <h2>Loughborough University - L79</h2>
            <h2>BEng Robotics, Mechatronics and Control Engineering</h2>
            <div class='flex gap-1'>
                <h2>WSUB35</h2>
            <h2>UCAS H402, H403</h2>
            </div>          
        </div>
    </div>
    <table class='page-table'>
        <thead>
            <tr>
                <th class='px-0.5 sm:px-2' rowspan="2"><span class='hidden sm:inline'>Course </span>Code</th>
                <th class='px-0.5 sm:px-2' rowspan="2">Award</th>
                <th rowspan="2">Title</th>
                <th class='hidden sm:table-cell' rowspan="2"><span class='hidden sm:inline'>Department</span><span class='inline sm:hidden'>Dept</span></th>
                <th colspan="3">Assessment Weighting</th>
                <th colspan="2">Fees</th>
            </tr>
            <tr>
                <th class='px-0.5 sm:px-2'>Exam</th>
                <th class='px-0.5 sm:px-2'><span class='hidden sm:inline'>Coursework</span><span class='inline sm:hidden'>CW</span></th>
                <th class='px-0.5 sm:px-2'>Project</th>
                <th class='px-0.5 sm:px-2'>Home</th>
                <th class='px-0.5 sm:px-2'>International</th>
            </tr>
        </thead>
        <tbody>
            {#each courses as course}
                <tr>
                    <td>
                        <a href={course.url} class="block">{course.code}</a>
                    </td>
                    <td>
                        <a href={course.url} class="block">{course.award}</a>
                    </td>
                    <td class="text-left ">
                        <a href={course.url} class="block">{course.title}</a>
                    </td>
                    <td class="hidden sm:inline text-left ">
                        <a href={course.url} class="block">{course.department}</a>
                    </td>
                    <td>
                        <a href={course.url} class="block">{course.examWeighting}</a>
                    </td>
                    <td>
                        <a href={course.url} class="block">{course.courseworkWeighting}</a>
                    </td>
                    <td>
                        <a href={course.url} class="block">{course.projectWeighting}</a>
                    </td>
                    <td>
                        <a href={course.url} class="block">{course.homeFees}</a>
                    </td>
                    <td>
                        <a href={course.url} class="block">{course.internationalFees}</a>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>




<style>
    /* table {
        @apply w-full table-auto mt-2;
    } */
    th {
        @apply text-xs sm:text-base font-medium py-2 bg-neutral-100 ;
    }
    tr {
        @apply text-center hover:bg-neutral-50 ;
    }
    td{
        @apply text-xs sm:text-base px-0.5 sm:px-2;
    }
    /* border-collapse border border-slate-500 */
</style>