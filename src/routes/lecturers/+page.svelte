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


<div class="card sm:mt-4 px-1 py-4">
	<h1>Lecturers</h1>
	<div class="flex w-full flex-col gap-2">
        <a href='/lecturers/robotics'>
		<div class="subcard flex justify-between place-items-center">
			<div class="index">
                <div class='flex gap-1 flex-wrap place-items-center'>
                    <h3 class='hidden sm:inline'>Loughborough University</h3>
                    <h3 class='text-gray-500'>Wolfson School of Mechanical, Electrical and Manufacturing Engineering</h3>
                </div>
				<h2 class='text-nowrap'>Dr Pete Hubbard</h2>
				<div class="flex flex-wrap gap-1">
                    <!-- <h4 class="">#WSUB35</h4> -->
                    <!-- <h4 class=''>20 Credits | 10 ECTS</h4> -->
                    <!-- <h4 class=''>80% Exam | 20% Coursework</h4> -->
					<!-- <h4 class="">Semester 1</h4> -->
                    <h4 class="">Control Systems Group</h4>
                    <h4 class="">WS200 Programme Director</h4>
                    <h4 class="">WS201A, WS202B, WS203C Module Leader</h4>
				</div>
			</div>
        </a>
        <a href='courses/robotics'>
        <div class="subcard flex justify-between place-items-center">
			<div class="index">
                <div class='flex gap-1 flex-wrap place-items-center'>
                    <h3 class='hidden sm:inline'>Loughborough University</h3>
                    <h3 class='text-gray-500'>School of Business and Economics</h3>
                </div>
				<h2 class='text-nowrap'>Dr Amanda Berry</h2>
				<div class="flex flex-wrap gap-1">
                    <h4 class="">Year in Enterprise Programme Director</h4>
                    <h4 class=''>LEN Director</h4>
				</div>
			</div>
        </a>
		</div>
	</div>

<!-- <div class='py-4 px-1 card mt-4 '>
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
                    <th class='px-2'>Research Group</th>
                </tr>
            </thead>
            <tbody>
                {#each modules as module}
                    <tr>
                        <td>
                            <a href={module.url} class="block">Dr</a>
                        </td>
                        <td class="text-center">
                            <a href={module.url} class="block">Peter</a>
                        </td>
                        <td class="text-center">
                            <a href={module.url} class="block">Hubbard</a>
                        </td>
                        <td class="text-center ">
                            <a href={module.url} class="block">p.hubbard@lboro.ac.uk</a>
                        </td>
                        <td>
                            <a href={module.url} class="block">Wolfson School of MEME</a>
                        </td>
                        <td>
                            <a href={module.url} class="block">Control Systems Group</a>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div> -->




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