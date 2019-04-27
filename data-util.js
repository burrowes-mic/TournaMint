function optimizeRoundRobin(phase, maxGroupCount, maxGroupSize, contenstantCount)
{
    var testingGroupCount = maxGroupCount;
    var bestCase = {groupCount = -1, matchCount: Number.MAX_SAFE_INTEGER};
    while(testingGroupCount >= 3)
    {
        var standardGroupSize = contenstantCount / testingGroupCount;
        var augmentedGroupCount = contestantCount % testingGroupCount;
        if((augmentedGroupCount > 0 && standardGroupSize + 1 > maxGroupSize) || standardGroupSize > maxGroupSize)
            break;

        var matchCount = standardGroupSize * (standardGroupSize - 1) * (testingGroupCount - augmentedGroupCount);
        matchCount += (standardGroupSize + 1) * standardGroupSize * augmentedGroupCount;
        if(matchCount < fewestMatchCount)
            bestCase = {groupCount: testingGroupCount, matchCount: matchCount};
            
        testingGroupCount--;
    }

    var standardGroupSize = contenstantCount / bestCase.groupCount;
    var augmentedGroupCount = contestantCount % bestCase.groupCount;
    for(var i = 0; i < bestCase.groupCount; ++i)
    {
        var groupSize = standardGroupSize;
        if(i < augmentedGroupCount)
            ++groupSize;
        var matchCount = 0;
        phase.groups.push({name: String.fromCharCode(i + 65), matches: []});
        for(var j = 0; j < groupSize + 1; ++j)
        {
            for(var k = j + 1; k < groupSize + 1; ++k)
            {
                var name = "Group " + group.name + ", Match " + (match_count + 1);
                ++match_count;
                phase.groups[i].matches.push({id: name, c1: group.member[j].id, c2: group.member[k].id});
            }
        }
    }


}