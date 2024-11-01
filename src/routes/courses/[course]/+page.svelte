<script>
	import { onMount } from 'svelte';

	let course = {
		programData: {
			programTitle: 'Aeronautical Engineering',
			degreeAward: 'MEng (Hons) + DIS / DPS / DIntS (See programme outline for further detail)',
			length: '4 Years or 5 Years including a placement year',
			department:
				'School of Aeronautical, Automotive, Chemical and Materials Engineering / Aeronautical and Automotive Engineering',
			campus: 'Loughborough',
			degreeCode: 'TTUM01',
			ucasCode: 'H402, H403'
		}
	};

	onMount(() => {
		// You can fetch course data here if needed
	});
</script>

<svelte:head>
	<title>{course.programData.programTitle} - University Course</title>
</svelte:head>

<div class="container grid grid-cols-2 gap-1.5 sm:pt-8 sm:grid-cols-7 sm:gap-6">
	<div class="col-span-2 sm:col-span-5">
		<div class="flex h-full flex-col justify-center">
			<div>
				<h1 class="text-base sm:text-4xl font-semibold">MEng {course.programData.programTitle}</h1>
				<h2 class="text-sm sm:text-2xl font-medium text-gray-800">
					Loughborough University <span class="text-gray-400"
						>- {course.programData.department}</span
					>
				</h2>
				<div class="my-1 flex gap-x-1">
					<h4 class="pill">
						UCAS Institution Code: L79
					</h4>
					<h4 class="pill">
						UCAS Code: {course.programData.ucasCode}
					</h4>
					<h4 class="pill">
						Internal Code: {course.programData.degreeCode}
					</h4>
				</div>
			</div>
		</div>
	</div>
	<div class="card row-span-2 col-span-1 sm:row-span-1 sm:col-span-2">
		<h2 class="">Fees</h2>
		<table class="w-full">
			<tr class="bg-gray-100">
				<th class=" text-left">Status</th>
				<th class=" text-center">Per Year</th>
			</tr>
			<tr>
				<td class=" text-left">Home</td>
				<td class=" text-center">£9,250</td>
			</tr>
			<tr class="bg-gray-100">
				<td class=" text-left"><span class='hidden sm:inline'>International</span><span class='sm:hidden'>Intl</span></td>
				<td class=" text-center">£27,000</td>
			</tr>
		</table>
	</div>

	<div class="card col-span-1 sm:col-span-2">
		<h2 class="">Length</h2>
		<h3 class="">4 years + optional <br/> placement year</h3>
	</div>
	<div class="card col-span-1 sm:col-span-2">
		<h2 class="mb-4 text-center text-2xl font-semibold">Credits</h2>
		<h3 class="text-center text-xl">480 UK, 240 ECTS</h3>
	</div>
	<div class="card col-span-2 sm:col-span-3">
		<h2 class="">Accredited by</h2>
		<ul class='text-xs sm:text-xl'>
			<li>Royal Aeronautical Society (RAeS)</li>
			<li>Institution of Mechanical Engineers (IMechE)</li>
		</ul>
	</div>
	<div class="card col-span-2 sm:col-span-3">
		<h2 class="">Entry Requirements</h2>
		<table class="w-full">
			<thead>
				<tr class="bg-gray-100">
					<th class=" text-left">System</th>
					<th class=" text-left">Score</th>
					<th class=" text-left">Additional Requirements</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="">UK (A-Levels)</td>
					<td class="">AAA</td>
					<td class="">Maths and Physics required</td>
				</tr>
				<tr class="bg-gray-50">
					<td class="">International Baccalaureate (IB)</td>
					<td class="">37</td>
					<td class="">HL Maths and Physics required</td>
				</tr>
			</tbody>
		</table>
	</div> 


	<div class="card col-span-1 sm:col-span-2">
		<h2 class="mb-4 text-2xl font-semibold">Assessment Methods</h2>
		<table class="w-full">
			<thead>
				<tr class="bg-gray-100">
					<th class="p-2 text-left">Method</th>
					<th class="p-2 text-left text-center">Weight</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="p-2">Exam</td>
					<td class="p-2 text-center">80%</td>
				</tr>
				<tr class="bg-gray-50">
					<td class="p-2">Coursework</td>
					<td class="p-2 text-center">10%</td>
				</tr>
				<tr>
					<td class="p-2">Project</td>
					<td class="p-2 text-center">10%</td>
				</tr>
			</tbody>
		</table>
		<p class="text-xxs sm:text-base font-medium text-neutral-400">* Only shows distribution in compulsary modules</p>
	</div>
	<div class="card col-span-1 sm:col-span-2">
		<h2 class="mb-4 text-2xl font-semibold">Content Split</h2>
		<table class="w-full">
			<thead>
				<tr class="bg-gray-100">
					<th class="p-2 text-left">Type</th>
					<th class="p-2 text-left">Weight</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="p-2">Compulsary</td>
					<td class="p-2 text-center">70%</td>
				</tr>
				<tr class="bg-gray-50">
					<td class="p-2">Optional (departmental)</td>
					<td class="p-2 text-center">10%</td>
				</tr>
				<tr>
					<td class="p-2">Optional (interdepartment)</td>
					<td class="p-2 text-center">10%</td>
				</tr>

			</tbody>
		</table>
	</div>

	<div class="card col-span-2 sm:col-span-4">
		<h2 class="mb-4 text-2xl font-semibold">Course Summary</h2>
		<p class="text-xs sm:text-base text-gray-700">
			This MEng Aeronautical Engineering program offers a comprehensive study of aeronautical
			principles and practices. Students will gain expertise in aircraft design, aerodynamics,
			propulsion systems, and materials science. The course includes a mix of theoretical knowledge
			and practical applications, preparing graduates for careers in the aerospace industry and
			related fields. With options for a placement year, this program provides a well-rounded
			education in aeronautical engineering.
		</p>
	</div>
	<div class="card col-span-2 sm:col-span-3">
		<h2 class="mb-4 text-2xl font-semibold">Content areas</h2>
		<div class="flex flex-wrap justify-center gap-0.5 sm:gap-2">
			<h3 class="pill">Fluid Dynamics</h3>
			<h3 class="pill">MATLAB</h3>
			<h3 class="pill">Aerospace Dynamics</h3>
			<h3 class="pill">Sensor Fusion</h3>
			<h3 class="pill">Unmanned Aerial Vehicles</h3>
			<h3 class="pill">Industrial Projects</h3>
			<h3 class="pill">Control Engineering</h3>
			<h3 class="pill">Avionics</h3>
			<h3 class="pill">Materials Science</h3>
			<h3 class="pill">Mechanics</h3>
		</div>
	</div>




	<div class="card col-span-2 sm:col-span-7 mb-8">
		<h2 class="mb-4 text-2xl font-semibold">Programme Structure</h2>
		<!-- <p class="text-xs sm:text-base text-gray-700 mb-4">
			The programme is structured over four years (with an optional placement year). Each year
			consists of modules that build upon previous knowledge, gradually increasing in complexity and
			specialization. Students will have the opportunity to choose optional modules in later years,
			allowing for customization of their degree path.
		</p> -->
		<!-- <a href="/degrees/1" class="my-4 rounded bg-gray-300 px-2 py-1 font-semibold"
			>View Full Course Structure</a
		> -->
		<div class="mt-4 grid grid-cols-1 gap-2 sm:gap-4">
			<div class="subcard col-span-1">
				<h2 class="">First Year (part A)</h2>
				<table class="w-full table-auto">
					<thead>
						<tr class="bg-gray-200">
							<th>Code</th>
							<th>Module Title</th>
							<th>Credits</th>
							<th>ECTS <span class='hidden sm:inline'>Credits</span></th>
							<th>Sem.</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>BSA005</td>
							<td class="text-left">Organisational Behaviour</td>
							<td>10</td>
							<td>5</td>
							<td>S1</td>
						</tr>
						<tr class="bg-gray-100">
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S1</a></td>
						</tr>
						<tr>
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S1</a></td>
						</tr>
						<tr class="bg-gray-100">
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S2</a></td>
						</tr>
						<tr>
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S2</a></td>
						</tr>
						<tr class="bg-gray-100">
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S2</a></td>
						</tr>
						<tr>
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S1 + S2</a></td>
						</tr>
						<tr class="bg-gray-100">
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S1 + S2</a></td>
						</tr>
					</tbody>
				</table>
			</div>
			<div class="subcard col-span-1">
				<h2 class="mb-4 text-2xl font-semibold">Second Year (part B)</h2>
				<table class="w-full table-auto">
					<thead>
						<tr class="bg-gray-200">
							<th>Code</th>
							<th>Module Title</th>
							<th>Credits</th>
							<th>ECTS <span class='hidden sm:inline'>Credits</span></th>
							<th>Sem.</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>BSA005</td>
							<td class="text-left">Organisational Behaviour</td>
							<td>10</td>
							<td>5</td>
							<td>S1</td>
						</tr>
						<tr class="bg-gray-100">
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S1</a></td>
						</tr>
						<tr>
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S1</a></td>
						</tr>
						<tr class="bg-gray-100">
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S2</a></td>
						</tr>
						<tr>
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S2</a></td>
						</tr>
						<tr class="bg-gray-100">
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S2</a></td>
						</tr>
						<tr>
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S1 + S2</a></td>
						</tr>
						<tr class="bg-gray-100">
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S1 + S2</a></td>
						</tr>
					</tbody>
				</table>
			</div>
			<div class="subcard col-span-1">
				<h2 class="mb text-2xl font-semibold">Optional Placement/Study Abroad Year (part I)</h2>
			</div>
			<div class="subcard col-span-1">
				<h2 class="text-2xl font-semibold">Third Year (part C)</h2>
				<h3 class="sm:-mt-4 text-xl font-medium">Compulsary</h3>
				<table class="w-full table-auto">
					<thead>
						<tr class="bg-gray-200">
							<th>Code</th>
							<th>Module Title</th>
							<th>Credits</th>
							<th>ECTS <span class='hidden sm:inline'>Credits</span></th>
							<th>Sem.</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>BSA005</td>
							<td class="text-left">Organisational Behaviour</td>
							<td>10</td>
							<td>5</td>
							<td>S1</td>
						</tr>
						<tr class="bg-gray-100">
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S1</a></td>
						</tr>
						<tr>
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S1</a></td>
						</tr>
						<tr class="bg-gray-100">
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S2</a></td>
						</tr>
						<tr>
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S2</a></td>
						</tr>
						<tr class="bg-gray-100">
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S2</a></td>
						</tr>
						<tr>
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S1 + S2</a></td>
						</tr>
						<tr class="bg-gray-100">
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S1 + S2</a></td>
						</tr>
					</tbody>
				</table>

				<h3 class="mt-4 text-xl font-medium">Optional</h3>
				<h4 class="mb-4 text-lg font-medium">
					Students must pick X credits from S1 and X credits from S2
				</h4>
				<table class="w-full table-auto">
					<thead>
						<tr class="bg-gray-200">
							<th>Code</th>
							<th>Module Title</th>
							<th>Credits</th>
							<th>ECTS <span class='hidden sm:inline'>Credits</span></th>
							<th>Sem.</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>BSA005</td>
							<td class="text-left">Organisational Behaviour</td>
							<td>10</td>
							<td>5</td>
							<td>S1</td>
						</tr>
						<tr class="bg-gray-100">
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S1</a></td>
						</tr>
						<tr>
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S1</a></td>
						</tr>
						<tr class="bg-gray-100">
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S2</a></td>
						</tr>
						<tr>
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S2</a></td>
						</tr>
						<tr class="bg-gray-100">
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S2</a></td>
						</tr>
						<tr>
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S1 + S2</a></td>
						</tr>
						<tr class="bg-gray-100">
							<td><a href="/modules/robotics/">BSA005</a></td>
							<td class="text-left"><a href="/modules/robotics/">Organisational Behaviour</a></td>
							<td><a href="/modules/robotics/">10</a></td>
							<td><a href="/modules/robotics/">5</a></td>
							<td><a href="/modules/robotics/">S1 + S2</a></td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
	 <!-- <div class="card col-span-2">
      <h2 class="mb-4 text-center text-2xl font-semibold">Grade Boundaries</h2>
      <table class="w-full">
        <tr class="bg-gray-100">
          <th class="p-2 text-left">UK</th>
          <th class="p-2 text-left">US</th>
          <th class="p-2 text-left">Percentage</th>
        </tr>
        <tr>
          <td class="p-2">1st</td>
          <td class="p-2">?</td>
          <td class="p-2">+70%</td>
        </tr>
        <tr class="bg-gray-50">
        <td class="p-2">2:1</td>
        <td class="p-2">?</td>
        <td class="p-2">59.5% - 69.5%</td>
      </tr>
      <tr>
        <td class="p-2">2:2</td>
        <td class="p-2">?</td>
        <td class="p-2">49.5% - 59.5%</td>
      </tr>
      <tr class="bg-gray-50">
        <td class="p-2">3rd (Pass)</td>
        <td class="p-2">?</td>
        <td class="p-2">39.5% - 49.5%</td>
      </tr>
    </table>
  </div>  -->
</div> 

<style>
	/* .pill {
		@apply rounded-full bg-neutral-200 px-2 py-0.5;
	} */
</style>
