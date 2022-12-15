open Query.Query

let input =
    """
filterBy Category = 'Fantasy'
orderBy Rating desc
skip 5
take 10
"""

match parse input with
| Result.Ok res -> printfn "%O" res
| Result.Error err -> printfn "%s" err
