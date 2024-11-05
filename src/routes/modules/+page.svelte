<script>
    // Example course data
    let modules = [
        {
            url: './modules/robotics',
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


<div class="card mt-4 px-1 py-4">
	<h1>Modules</h1>
	<div class="flex w-full flex-col gap-2">
        <a href='/modules/robotics'>
		<div class="subcard flex justify-between place-items-center">
			<div class="index">
                <div class='flex gap-1 flex-wrap place-items-center'>
                    <h3 class='hidden sm:inline'>Loughborough University</h3>
                    <h3 class='text-gray-500'>Wolfson School of Mechanical, Electrical and Manufacturing Engineering</h3>
                </div>
				<h2 class='text-nowrap'>Control Systems Design</h2>
				<div class="flex flex-wrap gap-1">
                    <h4 class="">#WSUB35</h4>
                    <h4 class=''>20 Credits | 10 ECTS</h4>
                    <h4 class=''>80% Exam | 20% Coursework</h4>
					<h4 class="">Semester 1</h4>
                    <h4 class="">Module Lead: Dr Pete Hubbard</h4>
				</div>
			</div>
        </a>
        <a href='courses/robotics'>
        <div class="subcard flex justify-between place-items-center">
			<div class="index">
                <div class='flex gap-1 flex-wrap place-items-center'>
                    <h3 class='hidden sm:inline'>Loughborough University</h3>
                    <h3 class='text-gray-500'>School of Design and Creative Arts / Design</h3>
                </div>
				<h2 class='text-nowrap'>Writing for Practice</h2>
				<div class="flex flex-wrap gap-1">
                    <h4 class="">#24ACA113</h4>
                    <h4 class=''>10 Credits | 5 ETCS</h4>
                    <h4 class=''>100% Coursework</h4>
					<h4 class="">Semester 2</h4>
                    <h4 class="">Module Lead: 	Prof PG Lindley</h4>
				</div>
			</div>
        </a>
		</div>
	</div>
	<!-- <table class="page-table">
		<thead>
			<tr>
				<th class="px-0.5 sm:px-2" rowspan="2"><span class="hidden sm:inline">Course </span>Code</th
				>
				<th class="px-0.5 sm:px-2" rowspan="2">Award</th>
				<th rowspan="2">Title</th>
				<th class="hidden sm:table-cell" rowspan="2"
					><span class="hidden sm:inline">Department</span><span class="inline sm:hidden">Dept</span
					></th
				>
				<th colspan="3">Assessment Weighting</th>
				<th colspan="2">Fees</th>
			</tr>
			<tr>
				<th class="px-0.5 sm:px-2">Exam</th>
				<th class="px-0.5 sm:px-2"
					><span class="hidden sm:inline">Coursework</span><span class="inline sm:hidden">CW</span
					></th
				>
				<th class="px-0.5 sm:px-2">Project</th>
				<th class="px-0.5 sm:px-2">Home</th>
				<th class="px-0.5 sm:px-2">International</th>
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
					<td class="text-left">
						<a href={course.url} class="block">{course.title}</a>
					</td>
					<td class="hidden text-left sm:inline">
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
	</table> -->


<!-- 
<div class='py-4 px-1 card mt-4 '>
    <h1 class='text-4xl font-semibold pb-4'>Modules</h1>
    <div>
        <table>
            <thead>
                <tr>
                    <th rowspan="2">Module Code</th>
                    <th rowspan="2">Title</th>
                    <th rowspan="2">Department</th>
                    <th rowspan="2">Credit Weight</th>
                    <th colspan="2">Assessment Weighting</th>
                </tr>
                <tr>
                    <th class='px-2'>Exam</th>
                    <th class='px-2'>Coursework</th>
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