const client = require('../database/db');

 const listConfreFilters = async () => {
        try {
            // Query to fetch province, divisions, and different quickcode types
            const queryQuickCode = `
                SELECT json_build_object(
                    'destyp', COALESCE(ARRAY_AGG(
                        json_build_object(
                            'quick_code', qm.quick_code,
                            'quickcode_name', qm.quickcode_name,
                            'language_code', qm.language_code,
                            'concurrency_val', qm.concurrency_val,
                            'created_by', qm.created_by,
                            'created_date', qm.created_date,
                            'province_code', pm.province_code,
                            'province_name', pm.province_name
                        )
                    ) FILTER (WHERE qm.quick_code_type = 'destyp'), '{}'),
                    
                    'divtyp', COALESCE(ARRAY_AGG(
                        json_build_object(
                            'quick_code', qm.quick_code,
                            'quickcode_name', qm.quickcode_name,
                            'language_code', qm.language_code,
                            'concurrency_val', qm.concurrency_val,
                            'created_by', qm.created_by,
                            'created_date', qm.created_date,
                            'province_code', pm.province_code,
                            'province_name', pm.province_name,
                            'divisions', (
                                SELECT COALESCE(ARRAY_AGG(
                                    json_build_object(
                                        'province_code', d.province_code,
                                        'province_name', pm.province_name,
                                        'division_code', d.division_code,
                                        'division_name', d.division_name,
                                        'language_code', d.language_code,
                                        'concurrency_val', d.concurrency_val,
                                        'created_by', d.created_by,
                                        'created_date', d.created_date
                                    )
                                ), '{}')
                                FROM estatus.division_setup_mst d
                                LEFT JOIN estatus.province_mst pm ON d.province_code = pm.province_code
                                WHERE d.division_type_code = qm.quick_code
                            )
                        )
                    ) FILTER (WHERE qm.quick_code_type = 'divtyp'), '{}'),

                    'memtyp', COALESCE(ARRAY_AGG(
                        json_build_object(
                            'quick_code', qm.quick_code,
                            'quickcode_name', qm.quickcode_name,
                            'language_code', qm.language_code,
                            'concurrency_val', qm.concurrency_val,
                            'created_by', qm.created_by,
                            'created_date', qm.created_date,
                            'province_code', pm.province_code,
                            'province_name', pm.province_name
                        )
                    ) FILTER (WHERE qm.quick_code_type = 'memtyp'), '{}'),

                    'natlty', COALESCE(ARRAY_AGG(
                        json_build_object(
                            'quick_code', qm.quick_code,
                            'quickcode_name', qm.quickcode_name,
                            'language_code', qm.language_code,
                            'concurrency_val', qm.concurrency_val,
                            'created_by', qm.created_by,
                            'created_date', qm.created_date,
                            'province_code', pm.province_code,
                            'province_name', pm.province_name
                        )
                    ) FILTER (WHERE qm.quick_code_type = 'natlty'), '{}')
                ) AS grouped_data
                FROM estatus.quickcode_mst qm
                LEFT JOIN estatus.province_mst pm ON qm.province_code = pm.province_code;
            `;

            // Additional queries for blood group, language, nationality, and province metadata
            const queryBloodGroup = "SELECT row_to_json(bloodgroup_metadata) AS data FROM estatus.bloodgroup_metadata";
            const queryLanguage = "SELECT row_to_json(languagemetadata) AS data FROM estatus.languagemetadata";
            const queryNationality = "SELECT row_to_json(nationalitymetadata) AS data FROM estatus.nationalitymetadata";
            const queryProvince = "SELECT province_code, province_name FROM estatus.province_mst";

            // Execute all queries in parallel
            const [quickCodeResult, bloodGroupResult, languageResult, nationalityResult, provinceResult] = await Promise.all([
                client.query(queryQuickCode),
                client.query(queryBloodGroup),
                client.query(queryLanguage),
                client.query(queryNationality),
                client.query(queryProvince)
            ]);

            // Check if grouped_data exists
            if (!quickCodeResult.rows.length || !quickCodeResult.rows[0].grouped_data) {
                console.error("grouped_data is missing or empty");
                throw new Error("Data retrieval error: grouped_data not found.");
            }

            const groupedData = quickCodeResult.rows[0].grouped_data;

            // Function to process "ALL" province grouping
            const processAllProvinceGrouping = (data) => {
                if (!data || !Array.isArray(data)) return []; // Prevent undefined errors

                const groupedEntries = {};
                data.forEach(item => {
                    const quickCodeKey = item.quickcode_name;

                    if (!groupedEntries[quickCodeKey]) {
                        groupedEntries[quickCodeKey] = {
                            quick_code: item.quickcode_name,
                            quickcode_name: item.quickcode_name,
                            province_code: "ALL",
                            province_name: "ALL",
                            divisions: []
                        };
                    }

                    if (item.divisions && Array.isArray(item.divisions)) {
                        item.divisions.forEach(division => {
                            const divisionKey = `${division.province_code}-${division.division_name}`; // Ensure uniqueness
                            
                            if (!groupedEntries[quickCodeKey].divisions.some(d => `${d.province_code}-${d.division_name}` === divisionKey)) {
                                groupedEntries[quickCodeKey].divisions.push({
                                    ...division,
                                    division_code: division.division_name // Set division_code to division_name
                                });
                            }
                        });
                    }
                });
                return Object.values(groupedEntries);
            };

            // Process and group "ALL" province data
            const allDivtypEntries = processAllProvinceGrouping(groupedData.divtyp || []);
            const allMemtypEntries = processAllProvinceGrouping(groupedData.memtyp || []);
            const allDestypEntries = processAllProvinceGrouping(groupedData.destyp || []);
            const allNatltyEntries = processAllProvinceGrouping(groupedData.natlty || []);

            // Construct final result object
            const combinedResult = {
                ...groupedData,
                divtyp: [...groupedData.divtyp, ...allDivtypEntries],
                memtyp: [...groupedData.memtyp, ...allMemtypEntries],
                destyp: [...groupedData.destyp, ...allDestypEntries],
                natlty: [...groupedData.natlty, ...allNatltyEntries],
                bloodgroup: bloodGroupResult.rows.map(row => row.data),
                language: languageResult.rows.map(row => row.data),
                nationality: nationalityResult.rows.map(row => row.data),
                province: provinceResult.rows
            };

            return combinedResult;
        } catch (error) {
            console.error("Error fetching filters:", error);
            throw new Error("Internal Server Error while fetching filters.");
        }
    };



const listCentreFilters = async () => {
    try {
        const queryQuickCode = `
            SELECT json_build_object(
                'divtyp', COALESCE(ARRAY_AGG(
                    json_build_object(
                        'quick_code', qm.quick_code,
                        'quickcode_name', qm.quickcode_name,
                        'language_code', qm.language_code,
                        'concurrency_val', qm.concurrency_val,
                        'created_by', qm.created_by,
                        'created_date', qm.created_date,
                        'province_code', pm.province_code,
                        'province_name', pm.province_name,
                        'divisions', (
                            SELECT COALESCE(ARRAY_AGG(
                                json_build_object(
                                    'province_code', d.province_code,
                                    'division_code', d.division_code,
                                    'division_name', d.division_name,
                                    'language_code', d.language_code,
                                    'concurrency_val', d.concurrency_val,
                                    'created_by', d.created_by,
                                    'created_date', d.created_date
                                )
                            ), '{}')
                            FROM estatus.division_setup_mst d
                            WHERE d.province_code = qm.province_code
                        )
                    )
                ) FILTER (WHERE qm.quick_code_type = 'divtyp'), '{}'),

                'apostl', COALESCE(ARRAY_AGG(
                    json_build_object(
                        'quick_code', qm.quick_code,
                        'quickcode_name', qm.quickcode_name,
                        'language_code', qm.language_code,
                        'concurrency_val', qm.concurrency_val,
                        'created_by', qm.created_by,
                        'created_date', qm.created_date,
                        'province_code', pm.province_code,
                        'province_name', pm.province_name
                    )
                ) FILTER (WHERE qm.quick_code_type = 'apostl'), '{}'),

                'ctrtyp', COALESCE(ARRAY_AGG(
                    json_build_object(
                        'quick_code', qm.quick_code,
                        'quickcode_name', qm.quickcode_name,
                        'language_code', qm.language_code,
                        'concurrency_val', qm.concurrency_val,
                        'created_by', qm.created_by,
                        'created_date', qm.created_date,
                        'province_code', pm.province_code,
                        'province_name', pm.province_name
                    )
                ) FILTER (WHERE qm.quick_code_type = 'ctrtyp'), '{}'),

                'diocse', COALESCE(ARRAY_AGG(
                    json_build_object(
                        'quick_code', qm.quick_code,
                        'quickcode_name', qm.quickcode_name,
                        'language_code', qm.language_code,
                        'concurrency_val', qm.concurrency_val,
                        'created_by', qm.created_by,
                        'created_date', qm.created_date,
                        'province_code', pm.province_code,
                        'province_name', pm.province_name
                    )
                ) FILTER (WHERE qm.quick_code_type = 'diocse'), '{}')
            ) AS grouped_data
            FROM estatus.quickcode_mst qm
            LEFT JOIN estatus.province_mst pm ON qm.province_code = pm.province_code;
        `;

        // Other queries
        const queryCommunityGroup = `SELECT row_to_json(community_house_dtl) AS data FROM estatus.community_house_dtl`;
        const queryLanguage = `SELECT row_to_json(languagemetadata) AS data FROM estatus.languagemetadata`;
        const queryProvince = `SELECT province_code, province_name FROM estatus.province_mst`;
        const queryState = `SELECT row_to_json(state_mst) AS data FROM estatus.state_mst`;
        const queryCountry = `SELECT row_to_json(country_mst) AS data FROM estatus.country_mst`;

        // Execute all queries in parallel
        const [quickCodeResult, communityGroupResult, languageResult, provinceResult, stateResult, countryResult] = await Promise.all([
            client.query(queryQuickCode),
            client.query(queryCommunityGroup),
            client.query(queryLanguage),
            client.query(queryProvince),
            client.query(queryState),
            client.query(queryCountry)
        ]);

        if (!quickCodeResult.rows.length || !quickCodeResult.rows[0].grouped_data) {
            console.error("grouped_data is missing or empty");
            throw new Error("Data retrieval error: grouped_data not found.");
        }

        const groupedData = quickCodeResult.rows[0].grouped_data;

        // Function to process "ALL" province grouping
        const processAllProvinceGrouping = (data) => {
            if (!data || !Array.isArray(data)) return [];

            const groupedEntries = {};
            data.forEach(item => {
                const quickCodeKey = item.quickcode_name;

                if (!groupedEntries[quickCodeKey]) {
                    groupedEntries[quickCodeKey] = {
                        quick_code: item.quickcode_name,
                        quickcode_name: item.quickcode_name,
                        province_code: "ALL",
                        province_name: "ALL",
                        divisions: []
                    };
                }
                if (item.divisions && Array.isArray(item.divisions)) {
                    item.divisions.forEach(division => {
                        const divisionKey = `${division.province_code}-${division.division_name}`; 

                        if (!groupedEntries[quickCodeKey].divisions.some(d => `${d.province_code}-${d.division_name}` === divisionKey)) {
                            groupedEntries[quickCodeKey].divisions.push({
                                ...division,
                                division_code: division.division_name
                            });
                        }
                    });
                }
            });
            return Object.values(groupedEntries);
        };

        // Apply "ALL" province grouping logic to all categories
        const allDivtypEntries = processAllProvinceGrouping(groupedData.divtyp || []);
        const allApostlEntries = processAllProvinceGrouping(groupedData.apostl || []);
        const allCtrtypEntries = processAllProvinceGrouping(groupedData.ctrtyp || []);
        const allDiocseEntries = processAllProvinceGrouping(groupedData.diocse || []);

        // Apply "ALL" province grouping logic to communitygroup
        const processAllProvinceGroupingForCommunity = (data) => {
            if (!data || !Array.isArray(data)) return [];
            return data.map(item => ({
                community_house_code: item.community_house_name,
                community_house_name: item.community_house_name,
                province_code: "ALL",
                province_name: "ALL",
                divisions: []
            }));
        };
        const allCommunityHouseEntries = processAllProvinceGroupingForCommunity(communityGroupResult.rows.map(row => row.data));


        const processAllStateGrouping = (data) => {
            if (!data || !Array.isArray(data)) return [];
            const groupedEntries = {};
        
            data.forEach(item => {
                const stateKey = item.state_name || item.quickcode_name; // Ensure correct key usage
                if (!groupedEntries[stateKey]) {
                    groupedEntries[stateKey] = {
                        state_code: stateKey,
                        state_name: stateKey,
                        province_code: "ALL",
                        province_name: "ALL",
                        divisions: []
                    };
                }
            });
        
            return Object.values(groupedEntries);
        };

        const processAllCountryGrouping = (data) => {
            if (!data || !Array.isArray(data)) return [];
            const groupedEntries = {};
            
            data.forEach(item => {
                const countryKey = item.country_name || item.quickcode_name; // Ensure correct key usage
                if (!groupedEntries[countryKey]) {
                    groupedEntries[countryKey] = {
                        country_code: countryKey,
                        country_name: countryKey,
                        province_code: "ALL",
                        province_name: "ALL",
                        divisions: []
                    };
                }
            });
        
            return Object.values(groupedEntries);
        };
        
        const allCountryEntries = processAllCountryGrouping(countryResult.rows.map(row => row.data));
        const allStateEntries = processAllStateGrouping(stateResult.rows.map(row => row.data));

        // Construct final result object
        const combinedResult = {
            ...groupedData,
            divtyp: [...groupedData.divtyp, ...allDivtypEntries],
            apostl: [...groupedData.apostl, ...allApostlEntries],
            ctrtyp: [...groupedData.ctrtyp, ...allCtrtypEntries],
            diocse: [...groupedData.diocse, ...allDiocseEntries],

            // Include "ALL" province grouping for communitygroup
            communitygroup: [...communityGroupResult.rows.map(row => row.data), ...allCommunityHouseEntries],

            // Additional data
            language: languageResult.rows.map(row => row.data),
            province: provinceResult.rows,
            state: [...stateResult.rows.map(row => row.data), ...allStateEntries],
            // country: countryResult.rows.map(row => row.data)
            country: [...countryResult.rows.map(row => row.data), ...allCountryEntries], // <-- Using it here
        };

        return combinedResult;
    } catch (error) {
        console.error("Error fetching centre filters:", error);
        throw new Error("Internal Server Error while fetching centre filters.");
    }
};


const listObituaryFilters = async () => {
    try {
        // Updated query to include `province_code` and `province_name`
        const queryQuickCode = `
            SELECT json_build_object(
                'memtyp', COALESCE(
                    ARRAY_AGG(
                        json_build_object(
                            'quick_code', qm.quick_code,
                            'quickcode_name', qm.quickcode_name,
                            'language_code', qm.language_code,
                            'concurrency_val', qm.concurrency_val,
                            'created_by', qm.created_by,
                            'created_date', qm.created_date,
                            'province_code', pm.province_code,
                            'province_name', pm.province_name
                        )
                    ) FILTER (WHERE qm.quick_code_type = 'memtyp'), '{}'
                )
            ) AS grouped_data
            FROM estatus.quickcode_mst qm
            LEFT JOIN estatus.province_mst pm ON qm.province_code = pm.province_code;
        `;

        // Other queries
        const queryLanguage = `SELECT row_to_json(languagemetadata) AS data FROM estatus.languagemetadata`;
        const queryProvince = `SELECT province_code, province_name FROM estatus.province_mst`;
        const queryCountry = `SELECT row_to_json(country_mst) AS data FROM estatus.country_mst`;

        // Execute all queries in parallel
        const [quickCodeResult, languageResult, provinceResult, countryResult] = await Promise.all([
            client.query(queryQuickCode),
            client.query(queryLanguage),
            client.query(queryProvince),
            client.query(queryCountry)
        ]);

        // Convert province result to a lookup object for quick reference
        const provinceMap = {};
        provinceResult.rows.forEach(prov => {
            provinceMap[prov.province_code] = prov.province_name;
        });

        // Process `memtyp` and generate ALL province entries per unique `quickcode_name`
        let memtypEntries = quickCodeResult.rows[0].grouped_data.memtyp || [];

        // Create a Set to store unique `quickcode_name` values
        const uniqueMemTypes = new Set(memtypEntries.map(item => item.quickcode_name));

        // Generate "ALL" province entries for each unique `quickcode_name`
        uniqueMemTypes.forEach(quickcode_name => {
            memtypEntries.push({
                quick_code: quickcode_name,
                quickcode_name: quickcode_name,
                province_code: "ALL",
                province_name: "ALL"
            });
        });

        // Process `country` and generate "ALL" province entry for each unique `country_name`
        let countryEntries = countryResult.rows.map(row => row.data);

        // Create a Set to store unique `country_name` values
        const uniqueCountries = new Set(countryEntries.map(item => item.country_name));

        // Generate "ALL" province entries for each unique `country_name`
        uniqueCountries.forEach(country_name => {
            countryEntries.push({
                country_code: country_name,
                country_name: country_name,
                province_code: "ALL",
                province_name: "ALL"
            });
        });

        // Construct final response object
        const combinedResult = {
            ...quickCodeResult.rows[0].grouped_data,
            memtyp: memtypEntries,
            language: languageResult.rows.map(row => row.data),
            province: provinceResult.rows,
            country: countryEntries
        };

        return combinedResult;
    } catch (error) {
        console.error("Error fetching obituary filters:", error);
        throw new Error("Internal Server Error while fetching obituary filters.");
    }
};

module.exports = { listConfreFilters, listCentreFilters, listObituaryFilters };
