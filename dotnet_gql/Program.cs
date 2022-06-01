using Microsoft.EntityFrameworkCore;
using gql.Data;
using gql.GraphQL;
using gql.GraphQL.Platforms;
using gql.GraphQL.Commands;
using GraphQL.Server.Ui.Voyager;

var builder = WebApplication.CreateBuilder(args);

ConfigurationManager configuration = builder.Configuration;

builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddSubscriptionType<Subscription>()
	.AddType<PlatformType>()
	.AddType<AddPlatformInputType>()
	.AddType<AddPlatformPayloadType>()
	.AddType<CommandType>()
	.AddType<AddCommandInputType>()
	.AddType<AddCommandPayloadType>()
    .AddFiltering()
    .AddSorting()
    .AddInMemorySubscriptions();

builder.Services.AddPooledDbContextFactory<AppDbContext>
(
    options => options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
);

var app = builder.Build();

#if DEBUG
{
    app.UseRouting()
    .UseGraphQLVoyager(new VoyagerOptions(){
        GraphQLEndPoint = "/graphql",
    })
    .UseEndpoints(endpoints => endpoints.MapGraphQLVoyager());
}
#endif

app.UseWebSockets();

app.UseRouting()
    .UseEndpoints(endpoints => endpoints.MapGraphQL());

app.Run();
