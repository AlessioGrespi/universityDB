<script>
    // Example course data
    let modules = [
        {
            url: './lecturers/lecturer',
            code: 'WSUB35',
            title: 'Robotics, Mechatronics and Control Engineering',
            department: 'Wolfson School of Mechanical, Electrical and Manufacturing Engineering',
            examWeighting: '80%',
            courseworkWeighting: '10%',
            credits: '10',
        },
        // Add more course data as needed
    ];
</script>

<div class='py-4 px-1 card mt-4 '>
    <h1 class='text-4xl font-semibold pb-4'>Lecturers</h1>
    <div>
        <table>
            <thead>
                <tr>
                    <th class='px-2'>Title</th>
                    <th class='px-2'>First Name</th>
                    <th class='px-2'>Surname</th>
                    <th class='px-2'>Email</th>
                    <th class='px-2'>Department</th>
                    <th class='px-2'>Research</th>
                </tr>
            </thead>
            <tbody>
                {#each modules as module}
                    <tr>
                        <td>
                            <a href={module.url} class="block">{module.code}</a>
                        </td>
                        <td class="text-left ">
                            <a href={module.url} class="block">{module.title}</a>
                        </td>
                        <td class="text-left ">
                            <a href={module.url} class="block">{module.department}</a>
                        </td>
                        <td class="text-center ">
                            <a href={module.url} class="block">{module.credits}</a>
                        </td>
                        <td>
                            <a href={module.url} class="block">{module.examWeighting}</a>
                        </td>
                        <td>
                            <a href={module.url} class="block">{module.courseworkWeighting}</a>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>




<style>
    table {
        @apply w-full table-auto mt-2;
    }
    th {
        @apply text-base font-medium py-2 bg-neutral-100 ;
    }
    tr {
        @apply text-center hover:bg-neutral-50 ;
    }
    td{
        @apply  px-2;
    }
    /* border-collapse border border-slate-500 */
</style>